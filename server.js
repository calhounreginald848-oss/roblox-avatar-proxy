// server.js
import express from "express";
import fetch from "node-fetch"; // make sure you have node-fetch installed

const app = express();
const PORT = process.env.PORT || 10000;

// PUT YOUR ROBLOX CLOUD API KEY HERE
const ROBLOX_API_KEY = "h/LQdc8ZNUORLhPjvOJz8zZTOx/1kpVO4InOoki+yglKC60oZXlKaGJHY2lPaUpTVXpJMU5pSXNJbXRwWkNJNkluTnBaeTB5TURJeExUQTNMVEV6VkRFNE9qVXhPalE1V2lJc0luUjVjQ0k2SWtwWFZDSjkuZXlKaGRXUWlPaUpTYjJKc2IzaEpiblJsY201aGJDSXNJbWx6Y3lJNklrTnNiM1ZrUVhWMGFHVnVkR2xqWVhScGIyNVRaWEoyYVdObElpd2lZbUZ6WlVGd2FVdGxlU0k2SW1ndlRGRmtZemhhVGxWUFVreG9VR3AyVDBwNk9IcGFWRTk0THpGcmNGWlBORWx1VDI5cmFTdDVaMnhMUXpZd2J5SXNJbTkzYm1WeVNXUWlPaUkwT1RVME9UZzVPVGs0SWl3aVpYaHdJam94TnpZeU9URXhNalU1";

app.get("/", (req, res) => {
  res.json({ message: "Roblox Avatar Proxy Running" });
});

app.get("/avatars/:userId", async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: "Missing userId" });

  try {
    const response = await fetch(`https://avatar.roblox.com/v1/users/${userId}/outfits`, {
      headers: {
        "x-api-key": ROBLOX_API_KEY
      }
    });

    if (response.status === 404) {
      return res.status(404).json({ error: "Roblox API responded with 404" });
    }
    if (response.status === 429) {
      return res.status(429).json({ error: "Rate limited by Roblox API" });
    }

    const data = await response.json();

    // Filter only editable outfits
    const editableOutfits = data.data.filter(o => o.isEditable);

    res.json({ data: editableOutfits });
  } catch (err) {
    console.error("Error fetching from Roblox API:", err);
    res.status(500).json({ error: "Failed to fetch from Roblox API" });
  }
});

app.listen(PORT, () => {
  console.log(`Roblox Avatar Proxy running on port ${PORT}`);
});
