// server.js
import express from "express";
import fetch from "node-fetch"; // npm install node-fetch

const app = express();
const PORT = process.env.PORT || 10000;

// Root route just responds with a simple message
app.get("/", (req, res) => {
  res.send("Roblox Avatar Proxy is running");
});

// Main endpoint: fetch avatars for a userId
app.get("/outfits/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const response = await fetch(`https://users.roblox.com/v2/users/${userId}/avatars`);
    if (!response.ok) {
      return res.status(response.status).json({ error: `Failed to fetch from Roblox API: ${response.status} ${response.statusText}` });
    }

    const data = await response.json();

    // Only keep editable avatars
    const editableAvatars = data.data.filter(a => a.isEditable === true);

    if (editableAvatars.length === 0) {
      return res.status(404).json({ error: "No editable avatars found for userId: " + userId });
    }

    return res.json({ data: editableAvatars });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Roblox Avatar Proxy running on port ${PORT}`);
});
