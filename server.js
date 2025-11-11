import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

// Fetch editable avatars for a Roblox user
async function fetchEditableAvatars(userId) {
    const url = `https://avatar.roblox.com/v2/users/${userId}/avatars`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch from Roblox API: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.data || !Array.isArray(data.data)) {
        return [];
    }

    // Filter only editable avatars
    return data.data.filter(item => item.isEditable === true);
}

app.get("/outfits/:userId", async (req, res) => {
    const userId = req.params.userId;

    try {
        const avatars = await fetchEditableAvatars(userId);
        res.json({ data: avatars });
    } catch (err) {
        console.error(`Failed to fetch from Roblox API: ${err}`);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy running on port ${PORT}`);
});
