const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache({ stdTTL: 60 }); // 1-minute cache
const PORT = process.env.PORT || 3000;

// Root route
app.get('/', (req, res) => {
  res.send('Roblox proxy is running. Use /outfits/:userId');
});

// Outfits route by user ID
app.get('/outfits/:userId', async (req, res) => {
  const userId = (req.params.userId || '').trim();
  if (!userId) {
    return res.status(400).json({ error: 'userId required' });
  }

  const cacheKey = `outfits:${userId}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    // Get outfits with browser-like headers
    const outfitsResp = await axios.get(
      `https://avatar.roblox.com/v1/users/${userId}/outfits?itemsPerPage=50`,
      { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } }
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
        `https://thumbnails.roblox.com/v1/outfits?outfitIds=${outfitIds}&size=150x150&format=Png&isCircular=false`,
        { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' } }
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
    console.error(
      'Failed to fetch outfits:',
      err.response?.status,
      err.response?.data || err.message
    );

    // Return empty array instead of failing if Roblox blocks the request
    res.json([]);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Roblox proxy listening on port ${PORT}`);
});
