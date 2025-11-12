const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache({ stdTTL: 60 }); // fixed NodeCache instance
const PORT = process.env.PORT || 3000;

// Root route for testing
app.get('/', (req, res) => {
  res.send('Roblox proxy is running. Use /api/outfits?username=USERNAME');
});

// Outfits route
app.get('/api/outfits', async (req, res) => {
  const username = (req.query.username || '').trim();
  if (!username) {
    return res.status(400).json({ error: 'username required' });
  }

  const cacheKey = `outfits:${username.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  try {
    // Get user ID from username
    const userResp = await axios.post(
      'https://users.roblox.com/v1/usernames/users',
      { usernames: [username] },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const userEntry = userResp.data?.data?.[0];
    if (!userEntry?.id) {
      return res.status(404).json({ error: 'user not found' });
    }

    const userId = userEntry.id;

    // Get outfits
    const outfitsResp = await axios.get(
      `https://avatar.roblox.com/v1/users/${userId}/outfits?itemsPerPage=150`
    );

    const outfitsRaw = outfitsResp.data.data || [];
    const outfits = outfitsRaw.filter(outfit => outfit?.isEditable !== false);

    if (outfits.length === 0) {
      cache.set(cacheKey, []);
      return res.json([]);
    }

    const outfitIds = outfits.map(o => o.id).join(',');
    let thumbs = [];

    if (outfitIds.length > 0) {
      const thumbResp = await axios.get(
        `https://thumbnails.roblox.com/v1/outfits?outfitIds=${outfitIds}&size=150x150&format=Png&isCircular=false`
      );
      thumbs = thumbResp.data.data || [];
    }

    const thumbMap = new Map();
    for (const t of thumbs) {
      thumbMap.set(t.targetId, t.imageUrl);
    }

    const payload = outfits.map(outfit => ({
      id: outfit.id,
      name: outfit.name,
      thumbnail: thumbMap.get(outfit.id) || null
    }));

    cache.set(cacheKey, payload);
    res.json(payload);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'failed to fetch outfits' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Roblox proxy listening on port ${PORT}`);
});
