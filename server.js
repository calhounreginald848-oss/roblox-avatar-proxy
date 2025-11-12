const express = require('express');
const axios = require('axios');
const NodeCache = new (require('node-cache'))({ stdTTL: 60 });

const app = express();
const cache = NodeCache;
const PORT = process.env.PORT || 3000;

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
    const userResp = await axios.post(
      'https://users.roblox.com/v1/usernames/users',
      { usernames: [username] },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const data = userResp.data;
    const userEntry = data?.data?.[0];
    if (!userEntry?.id) {
      return res.status(404).json({ error: 'user not found' });
    }

    const userId = userEntry.id;

    const outfitsResp = await axios.get(
      `https://avatar.roblox.com/v1/users/${userId}/outfits`
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

app.listen(PORT, () => {
  console.log(`Roblox proxy listening on port ${PORT}`);
});
