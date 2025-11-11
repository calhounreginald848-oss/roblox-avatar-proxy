// server.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch"; // For older Node.js versions

const app = express();
app.use(cors());

// ✅ Correct Roblox v2 Outfits API endpoint
const ROBLOX_V2_URL = "https://avatar.roblox.com/v2/users";

// Route to fetch editable outfits (saved avatars)
app.get("/avatars/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const response = await fetch(`${ROBLOX_V2_URL}/${userId}/outfits`);
    if (!response.ok) {
      return res.status(response.status).json({
        error: `Roblox API responded with ${response.status}`,
      });
    }

    const data = await response.json();

    if (!data.data || !Array.isArray(data.data)) {
      return res.status(500).json({ error: "Invalid data format from Roblox API" });
    }

    // ✅ Only include editable (user-saved) outfits
    const editableOutfits = data.data.filter((outfit) => outfit.isEditable);

    if (editableOutfits.length === 0) {
      return res.json({ data: [], message: "No editable outfits found for this user" });
    }

    res.json({
      data: editableOutfits.map((o) => ({
        id: o.id,
        name: o.name,
        playerAvatarType: o.playerAvatarType || "R15",
        isEditable: o.isEditable,
      })),
    });
  } catch (error) {
    console.error("Error fetching from Roblox API:", error);
    res.status(500).json({ error: "Failed to fetch from Roblox API" });
  }
});

// Root route to stop "Cannot GET /"
app.get("/", (req, res) => {
  res.send("✅ Roblox Avatar v2 Proxy is running!");
});

// Start server (Render/Local)
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
