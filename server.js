// server.js
import express from "express";
import fetch from "node-fetch"; // npm install node-fetch

const app = express();
const PORT = process.env.PORT || 3000;

// Root route
app.get("/", (req, res) => {
  res.send("Proxy is running. Use /outfits/:userId");
});

// Outfits route
app.get("/outfits/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ errors: [{ code: 1, message: "UserId required" }] });
  }

  try {
    // Roblox v2 inventory API
    const url = `https://inventory.roblox.com/v2/users/${userId}/inventory-items/collectibles`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch from Roblox API");

    const data = await response.json();

    // Filter only editable Avatar outfits
    const editableAvatars = data.data.filter(
      item => item.isEditable && item.outfitType === "Avatar"
    );

    if (editableAvatars.length === 0) {
      return res.json({ data: [] });
    }

    // Map to simpler format for Roblox script
    const formatted = editableAvatars.map(item => ({
      id: item.id,
      name: item.name,
      playerAvatarType: "R15" // default, you can adjust later
    }));

    return res.json({ data: formatted });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ errors: [{ code: 0, message: "InternalServerError" }] });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
