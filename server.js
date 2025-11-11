// server.js
import express from "express";
import fetch from "node-fetch"; // npm install node-fetch@2
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/outfits/:userId", async (req, res) => {
    const userId = req.params.userId;

    if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: "Invalid userId" });
    }

    try {
        // Fetch all outfits from Roblox v2 endpoint
        const response = await fetch(`https://avatar.roblox.com/v2/avatar/users/${userId}/outfits`);
        const data = await response.json();

        if (data.errors) {
            return res.status(500).json({ error: data.errors });
        }

        // Strict filter: only editable AND type Avatar
        const savedAvatars = data.data.filter(outfit => 
            outfit.isEditable === true && outfit.outfitType === "Avatar"
        );

        const formatted = savedAvatars.map(outfit => ({
            id: outfit.id,
            name: outfit.name,
            playerAvatarType: outfit.outfitType
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
