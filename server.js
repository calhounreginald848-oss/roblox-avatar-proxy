// server.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch"; // For older Node.js versions

const app = express();
app.use(cors());

// ✅ Roblox Avatars v2 API endpoint
const ROBLOX_V2_URL = "https://avatar.roblox.com/v2/users";

// Route to fetch editable avatars
app.get("/avatars/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const response = await fetch(`${ROBLOX_V2_URL}/${userId}/avatars`);

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Roblox API responded with ${response.status}`,
      });
    }

    const data = await response.json();

    // Make sure "data" exists and is a list
    if (!data.data || !Array.isArray(data.data)) {
      return res.status(500).json({ error: "Invalid data format from Roblox API" });
    }

    // Filter only editable avatars (user-saved outfits)
    const editableAvatars = data.data.filter((avatar) => avatar.isEditable);

    if (editableAvatars.length === 0) {
      return res.json({ data: [], message: "No editable avatars found for this user" });
    }

    // Return only needed info for Roblox Studio
    res.json({
      data: editableAvatars.map((a) => ({
        id: a.id,
        name: a.name,
        playerAvatarType: a.playerAvatarType || "R15",
        isEditable: a.isEditable,
      })),
    });
  } catch (error) {
    console.error("Error fetching from Roblox API:", error);
    res.status(500).json({ error: "Failed to fetch from Roblox API" });
  }
});

// ✅ Root route (prevents 'Cannot GET /')
app.get("/", (req, res) => {
  res.send("✅ Roblox Avatar v2 Proxy is running!");
});

// Start server on Render port (or local)
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
