import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

// Your Roblox Cloud API Key
const API_KEY = "h/LQdc8ZNUORLhPjvOJz8zZTOx/1kpVO4InOoki+yglKC60oZXlKaGJHY2lPaUpTVXpJMU5pSXNJbXRwWkNJNkluTnBaeTB5TURJeExUQTNMVEV6VkRFNE9qVXhPalE1V2lJc0luUjVjQ0k2SWtwWFZDSjkuZXlKaGRXUWlPaUpTYjJKc2IzaEpiblJsY201aGJDSXNJbWx6Y3lJNklrTnNiM1ZrUVhWMGFHVnVkR2xqWVhScGIyNVRaWEoyYVdObElpd2lZbUZ6WlVGd2FVdGxlU0k2SW1ndlRGRmtZemhhVGxWUFVreG9VR3AyVDBwNk9IcGFWRTk0THpGcmNGWlBORWx1VDI5cmFTdDVaMnhMUXpZd2J5SXNJbTkzYm1WeVNXUWlPaUkwT1RVME9UZzVPVGs0SWl3aVpYaHdJam94TnpZeU9URXhNalU1TENKcFlYUWlPakUzTmpJNU1EYzJOVGtzSW01aVppSTZNVGMyTWprd056WTFPWDAuUVBIS28zOHFiUTQzajJFWDhQalBnamI1T2w1bjVVRGdRTXBHSElrYnB2WWx1aXpjUDBMRDhWYlZISGFVczJCX1hpSFZUOXg1WDlYRnZISHlURTRIWHoyRE80NHFRVWx3dGR3VUlDV1QxR2ZxSldyaHNzdEQwendWQWxNSlc0VGVjbVkzVWJyc2QtSHMyREp1cVBqM3dIVHpJOUF2R0ota29wSm9TTldsUlcwb041b2dFcWJRS3pUUjcxTF80VldmdkI3X3czSVhOaGpUSTFJYUEyRDJsQTBINmFuQTdjd3ZYaENmeFB3Y0YwNEtfN09pZG42dkZBWHNXT1hGVDBKYmZTNnU3OGRKbkpnWnpScTlDMVM0NnhOV1FUX1dFaFc3N240a0hCa1FzSlpJd0psUlZjOG1pYUpNU2J1bVVSUnRtUWdMRWR1NmhsQzZaZE9sSTlwbG1R";

// Endpoint: fetch editable avatars for a user
app.get("/avatars/:userId", async (req, res) => {
  const { userId } = req.params;
  const apiUrl = `https://avatar.roblox.com/v1/users/${userId}/avatars`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({
        error: `Roblox API responded with ${response.status}`,
        message: text,
      });
    }

    const data = await response.json();

    // Only return editable avatars
    const editableAvatars = data.data.filter(a => a.isEditable);

    res.json({ data: editableAvatars });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch from Roblox API", details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Roblox Avatar Proxy (V2) running on port ${PORT}`);
});
