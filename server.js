import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.send("✅ Roblox Avatar Proxy is running");
});

app.get("/outfits/:userId", async (req, res) => {
  const userId = req.params.userId;
  const apiUrl = `https://avatar.roblox.com/v2/avatar/users/${userId}/outfits?itemsPerPage=50&page=1`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch outfits", details: err.message });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
