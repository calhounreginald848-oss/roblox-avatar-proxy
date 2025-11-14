const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache({ stdTTL: 60 });
const PORT = process.env.PORT || 3000;

// Root
app.get('/', (req, res) => {
  res.send('Roblox outfit proxy running. Use /outfits/:userId');
});

// Fetch outfits (max: 150)
app.get('/outfits/:userId', async (req, res) => {
  const userId = req.params.userId?.trim();
  if (!userId) return res.status(400).json({ error: "userId required" });

  const cacheKey = `outfits:${userId}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {

    // --- 1. Fetch up to 150 outfits from Roblox ---
    const outfitsResp = await axios.get(
      `https://avatar.roblox.com/v1/users/${userId}/outfits?itemsPerPage=150`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );

    const outfits = outfitsResp.data.data || [];

    if (outfits.length === 0) {
      cache.set(cacheKey, []);
      return res.json([]);
    }

    // --- 2. Fetch thumbnails in chunks of 50 ---
    const outfitIds = outfits.map(o => o.id);
    const thumbs = [];

    const chunkSize = 50;
    for (let i = 0; i < outfitIds.length; i += chunkSize) {
      const chunk = outfitIds.slice(i, i + chunkSize);

      const resp = await axios.get(
        `https://thumbnails.roblox.com/v1/outfits`,
        {
          params: {
            outfitIds: chunk.join(','),
            size: "150x150",
            format: "Png",
            isCircular: false
          },
          headers: { "User-Agent": "Mozilla/5.0" }
        }
      );

      thumbs.push(...(resp.data.data || []));
    }

    // Map thumbnails
    const thumbMap = new Map();
    thumbs.forEach(t => {
      if (t.state === "Completed") thumbMap.set(t.targetId, t.imageUrl);
    });

    // --- 3. Final formatted response ---
    const payload = outfits.map(o => ({
      id: o.id,
      name: o.name,
      isEditable: o.isEditable,
      type: o.type,
      thumbnail: thumbMap.get(o.id) || null
    }));

    cache.set(cacheKey, payload);
    res.json(payload);

  } catch (err) {
    console.error("Error fetching outfits:", err.response?.status, err.response?.data || err.message);
    res.json([]);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Roblox proxy listening on port ${PORT}`);
});
