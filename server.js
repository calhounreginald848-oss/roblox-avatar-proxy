const express = require('express');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache({ stdTTL: 60 });
const PORT = process.env.PORT || 3000;

// ---- PING ROUTE ----
app.get('/ping', (req, res) => {
  res.send('Pong! Service is alive.');
});

// ---- ROOT ROUTE ----
app.get('/', (req, res) => {
  res.send('Roblox outfit proxy running. Use /outfits/:userId');
});

// ---- OUTFIT ROUTE ----
app.get('/outfits/:userId', async (req, res) => {
  const userId = req.params.userId?.trim();
  if (!userId) return res.status(400).json({ error: "userId required" });

  const cacheKey = `outfits:${userId}`;
  const cached = cache.get(cacheKey);
  if (cached) return res.json(cached);

  try {
    const url = `https://avatar.roblox.com/v1/users/${userId}/outfits?page=1&itemsPerPage=150`;
    const response = await axios.get(url);

    const outfits = response.data?.data || [];
    const editableOutfits = outfits.filter(o => o.isEditable === true);

    cache.set(cacheKey, editableOutfits);
    res.json(editableOutfits);

  } catch (err) {
    console.error("=== ROBLOX API ERROR ===", err.message);
    res.status(500).json({
      error: true,
      message: err.message,
      robloxStatus: err.response?.status || null,
      robloxResponse: err.response?.data || null
    });
  }
});

// ---- START SERVER ----
app.listen(PORT, () => {
  console.log(`Roblox proxy listening on port ${PORT}`);
});
