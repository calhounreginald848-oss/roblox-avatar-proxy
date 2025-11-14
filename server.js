const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache({ stdTTL: 60 });
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Roblox outfit proxy running. Use /outfits/:userId');
});

app.get('/outfits/:userId', async (req, res) => {
  const userId = req.params.userId?.trim();
  if (!userId) return res.status(400).json({ error: "userId required" });

  const cacheKey = `outfits:${userId}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    // ------------------------------------------------------------------
    // 1. USE THE EXACT WORKING VERIFIED ROBLOX URL
    // ------------------------------------------------------------------
    const robloxUrl =
      `https://avatar.roblox.com/v1/users/${userId}/outfits?page=1&itemsPerPage=150`;

    const outfitsResp = await axios.get(robloxUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate, br"
      }
    });

    const outfits = outfitsResp.data?.data || [];

    if (outfits.length === 0) {
      cache.set(cacheKey, []);
      return res.json([]);
    }

    // ------------------------------------------------------------------
    // 2. FETCH THUMBNAILS (SAFE CHUNKING)
    // ------------------------------------------------------------------
    const outfitIds = outfits.map(o => o.id);
    const thumbnails = [];

    const chunkSize = 50;
    for (let i = 0; i < outfitIds.length; i += chunkSize) {
      const chunk = outfitIds.slice(i, i + chunkSize);

      const thumbResp = await axios.get(
        "https://thumbnails.roblox.com/v1/outfits",
        {
          params: {
            outfitIds: chunk.join(","),
            size: "150x150",
            format: "Png",
            isCircular: false
          },
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Accept": "application/json",
            "Accept-Encoding": "gzip, deflate, br"
          }
        }
      );

      if (thumbResp.data?.data) {
        thumbnails.push(...thumbResp.data.data);
      }
    }

    // Map thumbnails by outfit ID
    const thumbMap = new Map();
    thumbnails.forEach(t => {
      if (t.state === "Completed") thumbMap.set(t.targetId, t.imageUrl);
    });

    // ------------------------------------------------------------------
    // 3. BUILD FINAL RESPONSE
    // ------------------------------------------------------------------
    const final = outfits.map(o => ({
      id: o.id,
      name: o.name,
      isEditable: o.isEditable,
      type: o.type,
      thumbnail: thumbMap.get(o.id) || null
    }));

    cache.set(cacheKey, final);
    res.json(final);

  } catch (err) {
    console.error("=== ROBLOX API ERROR ===");
    console.error("URL:", err.config?.url);
    console.error("Status:", err.response?.status);
    console.error("Data:", err.response?.data);
    console.error("Message:", err.message);
    console.error("========================");

    return res.status(500).json({
      error: true,
      message: err.message,
      robloxStatus: err.response?.status || null,
      robloxResponse: err.response?.data || null
    });
  }
});

app.listen(PORT, () => {
  console.log(`Roblox proxy listening on port ${PORT}`);
});
