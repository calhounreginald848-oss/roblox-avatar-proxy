import express from "express";
import fetch from "node-fetch"; // npm install node-fetch@3

const app = express();
app.use(express.json());

const ROBLOX_OUTFITS_ENDPOINT = "https://avatar.roblox.com/v2/users";

const PORT = process.env.PORT || 10000;

// Helper to fetch only editable avatars
async function fetchEditableAvatars(userId) {
    const url = `${ROBLOX_OUTFITS_ENDPOINT}/${userId}/outfits`;

    try {
        const res = await fetch(url, {
            headers: {
                "User-Agent": "RobloxProxy/1.0"
            }
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        if (!data.data) return [];

        // Filter out non-editable and unwanted outfit types
        const filtered = data.data.filter(
            outfit => outfit.isEditable === true && outfit.outfitType === "Avatar"
        );

        return filtered.map(o => ({
            id: o.id,
            name: o.name,
            playerAvatarType: "R15" // Roblox default, can change later if you want
        }));
    } catch (err) {
        console.error("Failed to fetch from Roblox API:", err);
        return null;
    }
}

// Route to get user avatars
app.get("/outfits/:userId", async (req, res) => {
    const userId = req.params.userId;

    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const avatars = await fetchEditableAvatars(userId);

    if (!avatars) return res.status(500).json({ error: "Failed to fetch from Roblox API" });

    if (avatars.length === 0) return res.status(404).json({ error: "No editable avatars found" });

    res.json({ data: avatars });
});

// Basic test route
app.get("/", (req, res) => res.send("Roblox Avatar Proxy is running."));

app.listen(PORT, () => {
    console.log(`Roblox Avatar Proxy running on port ${PORT}`);
});
