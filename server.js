// server.js
import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

// Health check route
app.get("/", (req, res) => {
  res.send("Roblox Avatar Proxy is running.");
});

// Outfits/avatars route
app.get("/outfits/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const url = `https://avatar.roblox.com/v2/users/${userId}/avatars`;
    const response = await fetch(url, {
      headers: {
        "User-Agent": "RobloxProxy/1.0"
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Failed to fetch from Roblox API: ${response.status} ${response.statusText}` });
    }

    const data = await response.json();

    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      return res.json({ data: [] });
    }

    // Filter only editable avatars
    const editable = data.data.filter(item => item.isEditable === true && item.outfitType === "Avatar");

    return res.json({ data: editable });
  } catch (err) {
    console.error("Proxy error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
