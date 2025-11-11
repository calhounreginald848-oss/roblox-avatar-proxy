// server.js
import express from "express";
import fetch from "node-fetch"; // make sure to install node-fetch@3

const app = express();
const PORT = process.env.PORT || 10000;

// Helper: fetch editable avatars from Roblox v2
async function fetchEditableAvatars(userId) {
  const url = `https://avatar.roblox.com/v2/users/${userId}/inventory-items`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 404) {
        // User has no avatars
        return [];
      }
      throw new Error(`HTTP ${res.status}`);
    }

    const json = await res.json();
    if (!json.data) return [];

    // Filter: only editable avatars
    const avatars = json.data.filter(
      (item) => item.isEditable && item.outfitType === "Avatar"
    );

    return avatars;
  } catch (err) {
    console.error("Failed to fetch from Roblox API:", err);
    return null; // proxy can handle null as an error
  }
}

// Proxy endpoint
app.get("/outfits/:userId", async (req, res) => {
  const userId = req.params.userId;

  const avatars = await fetchEditableAvatars(userId);
  if (avatars === null) {
    return res.status(500).json({ error: "Failed to fetch from Roblox API" });
  }

  return res.json({ data: avatars });
});

// Health check
app.get("/", (req, res) => {
  res.send("Roblox Avatar Proxy is running.");
});

app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
