// server.js
import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

// YOUR Roblox Cloud API key here
const CLOUD_KEY = "h/LQdc8ZNUORLhPjvOJz8zZTOx/1kpVO4InOoki+yglKC60oZXlKaGJHY2lPaUpTVXpJMU5pSXNJbXRwWkNJNkluTnBaeTB5TURJeExUQTNMVEV6VkRFNE9qVXhPalE1V2lJc0luUjVjQ0k2SWtwWFZDSjkuZXlKaGRXUWlPaUpTYjJKc2IzaEpiblJsY201aGJDSXNJbWx6Y3lJNklrTnNiM1ZrUVhWMGFHVnVkR2xqWVhScGIyNVRaWEoyYVdObElpd2lZbUZ6WlVGd2FVdGxlU0k2SW1ndlRGRmtZemhhVGxWUFVreG9VR3AyVDBwNk9IcGFWRTk0THpGcmNGWlBORWx1VDI5cmFTdDVaMnhMUXpZd2J5SXNJbTkzYm1WeVNXUWlPaUkwT1RVME9UZzVPVGs0SWl3aVpYaHdJam94TnpZeU9URXhNalU1TENKcFlYUWlPakUzTmpJNU1EYzJOVGtzSW01aVppSTZNVGMyTWprd056WTFPWDAuUVBIS28zOHFiUTQzajJFWDhQalBnamI1T2w1bjVVRGdRTXBHSElrYnB2WWx1aXpjUDBMRDhWYlZISGFVczJCX1hpSFZUOXg1WDlYRnZISHlURTRIWHoyRE80NHFRVWx3dGR3VUlDV1QxR2ZxSldyaHNzdEQwendWQWxNSlc0VGVjbVkzVWJyc2QtSHMyREp1cVBqM3dIVHpJOUF2R0ota29wSm9TTldsUlcwb041b2dFcWJRS3pUUjcxTF80VldmdkI3X3czSVhOaGpUSTFJYUEyRDJsQTBINmFuQTdjd3ZYaENmeFB3Y0YwNEtfN09pZG42dkZBWHNXT1hGVDBKYmZTNnU3OGRKbkpnWnpScTlDMVM0NnhOV1FUX1dFaFc3N240a0hCa1FzSlpJd0psUlZjOG1pYUpNU2J1bVVSUnRtUWdMRWR1NmhsQzZaZE9sSTlwbG1R";

// Root route
app.get("/", (req, res) => {
  res.send("Roblox Avatar Proxy v2 is running.");
});

// Fetch avatars for a user
app.get("/avatars/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  const url = `https://avatar.roblox.com/v1/users/${userId}/outfits/2`;

  try {
    const response = await fetch(url, {
      headers: {
        "x-api-key": CLOUD_KEY,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 404) {
      return res.status(404).json({
        error: "Roblox API responded with 404",
        message: JSON.stringify({ errors: [{ code: 0, message: "NotFound" }] }),
      });
    }

    if (response.status === 429) {
      return res.status(429).json({
        error: "Roblox API rate limit hit",
        message: "Try again later",
      });
    }

    const data = await response.json();

    if (!data || !data.data || data.data.length === 0) {
      return res.json({ data: [] });
    }

    // Only return editable outfits
    const editable = data.data.filter((o) => o.isEditable);

    res.json({ data: editable });
  } catch (err) {
    console.error("Failed to fetch from Roblox API", err);
    res.status(500).json({ error: "Failed to fetch from Roblox API" });
  }
});

app.listen(PORT, () => {
  console.log(`Roblox Avatar Proxy running on port ${PORT}`);
});
