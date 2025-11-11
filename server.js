// server.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());

// ✅ Correct Roblox v2 outfits endpoint
const ROBLOX_API = "https://avatar.roblox.com/v2/avatar/users";

// Fetch outfits for a user
app.get("/avatars/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    // ✅ Hit the actual Roblox v2 avatar outfits endpoint
    const robloxRes = await fetch(`${ROBLOX_API}/${userId}/outfits`);

    if (!robloxRes.ok) {
      console.error(`Roblox API responded with ${robloxRes.status}`);
      return res.status(robloxRes.status).json({
        error: `Roblox API responded with ${robloxRes.status}`,
      });
    }

    const json = await robloxRes.json();

    if (!json.data || !Array.isArray(json.data)) {
      return res.status(500).json({ error: "Invalid data format from Roblox API" });
    }

    // ✅ Keep only editable outfits (user-saved avatars)
    const editable = json.data.filter((outfit) => outfit.isEditable === true);

    res.json({
      data: editable.map((outfit) => ({
        id: outfit.id,
        name: outfit.name,
        playerAvatarType: outfit.playerAvatarType || "R15",
        isEditable: outfit.isEditable,
      })),
    });
  } catch (err) {
    console.error("Error fetching from Roblox API:", err);
    res.status(500).json({ error: "Failed to fetch from Roblox API" });
  }
});

// Root route for health check
app.get("/", (req, res) => {
  res.send("✅ Roblox v2 Avatar Proxy is running!");
});

// Start the server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
