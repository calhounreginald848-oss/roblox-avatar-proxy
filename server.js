// server.js
const express = require("express");
const fetch = require("node-fetch"); // Make sure to npm install node-fetch
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/outfits/:userId", async (req, res) => {
    const userId = req.params.userId;

    if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: "Invalid userId" });
    }

    try {
        // Fetch all outfits using v2 endpoint
        const response = await fetch(`https://avatar.roblox.com/v2/avatar/users/${userId}/outfits`);
        const data = await response.json();

        if (data.errors) {
            return res.status(500).json({ error: data.errors });
        }

        // Filter out non-editable outfits (animation packs, dynamic heads)
        const savedAvatars = data.data.filter(outfit => outfit.isEditable === true);

        // Optional: rename models in the response to the avatar names
        const formatted = savedAvatars.map(outfit => ({
            id: outfit.id,
            name: outfit.name,
            playerAvatarType: outfit.outfitType // e.g., "Avatar"
        }));

        return res.json({ data: formatted });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});
