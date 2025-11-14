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
    // Fetch outfits using the verified working endpoint
    const url = `https://avatar.roblox.com/v1/users/${userId}/outfits?page=1&itemsPerPage=150`;
    const response = await axios.get(url);

    const outfits = response.data?.data || [];

    // Build simple payload
    const finalData = outfits.map(o => ({
      id: o.id,
      name: o.name,
      isEditable: o.isEditable,
      type: o.type
    }));

    cache.set(cacheKey, finalData);
    res.json(finalData);

  } catch (err) {
    console.error("=== ROBLOX API ERROR ===");
    console.error("URL:", err.config?.url);
    console.error("Status:", err.response?.status);
    console.error("Data:", err.response?.data);
    console.error("Message:", err.message);
    console.error("========================");

    res.status(500).json({
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
