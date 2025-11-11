// server.js
import express from "express";
import fetch from "node-fetch"; // install via npm i node-fetch@2

const app = express();
const PORT = process.env.PORT || 3000;

// Roblox API endpoint to get user outfits (v2)
const ROBLOX_OUTFITS_API = "https://avatar.roblox.com/v2/users/"; // we'll append userId + "/inventory-items/outfits"

app.get("/outfits/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const response = await fetch(`${ROBLOX_OUTFITS_API}${userId}/inventory-items/outfits`);
    const data = await response.json();

    if (!data || !data.data) {
      return res.status(404).json({ error: "No outfits found" });
    }

    // Filter: only editable avatars
    const editableAvatars = data.data.filter(item => item.isEditable === true && item.outfitType === "Avatar");

    res.json({ data: editableAvatars });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
