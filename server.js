import express from "express";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 10000;

// <<< REPLACE THIS WITH YOUR CLOUD API KEY >>>
const CLOUD_KEY = "h/LQdc8ZNUORLhPjvOJz8zZTOx/1kpVO4InOoki+yglKC60oZXlKaGJHY2lPaUpTVXpJMU5pSXNJbXRwWkNJNkluTnBaeTB5TURJeExUQTNMVEV6VkRFNE9qVXhPalE1V2lJc0luUjVjQ0k2SWtwWFZDSjkuZXlKaGRXUWlPaUpTYjJKc2IzaEpiblJsY201aGJDSXNJbWx6Y3lJNklrTnNiM1ZrUVhWMGFHVnVkR2xqWVhScGIyNVRaWEoyYVdObElpd2lZbUZ6WlVGd2FVdGxlU0k2SW1ndlRGRmtZemhhVGxWUFVreG9VR3AyVDBwNk9IcGFWRTk0THpGcmNGWlBORWx1VDI5cmFTdDVaMnhMUXpZd2J5SXNJbTkzYm1WeVNXUWlPaUkwT1RVME9UZzVPVGs0SWl3aVpYaHdJam94TnpZeU9URXhNalU1TENKcFlYUWlPakUzTmpJNU1EYzJOVGtzSW01aVppSTZNVGMyTWprd056WTFPWDAuUVBIS28zOHFiUTQzajJFWDhQalBnamI1T2w1bjVVRGdRTXBHSElrYnB2WWx1aXpjUDBMRDhWYlZISGFVczJCX1hpSFZUOXg1WDlYRnZISHlURTRIWHoyRE80NHFRVWx3dGR3VUlDV1QxR2ZxSldyaHNzdEQwendWQWxNSlc0VGVjbVkzVWJyc2QtSHMyREp1cVBqM3dIVHpJOUF2R0ota29wSm9TTldsUlcwb041b2dFcWJRS3pUUjcxTF80VldmdkI3X3czSVhOaGpUSTFJYUEyRDJsQTBINmFuQTdjd3ZYaENmeFB3Y0YwNEtfN09pZG42dkZBWHNXT1hGVDBKYmZTNnU3OGRKbkpnWnpScTlDMVM0NnhOV1FUX1dFaFc3N240a0hCa1FzSlpJd0psUlZjOG1pYUpNU2J1bVVSUnRtUWdMRWR1NmhsQzZaZE9sSTlwbG1R";

app.get("/avatars/:userId", async (req, res) => {
  const { userId } = req.params;

  if (!userId) return res.status(400).json({ error: "No userId provided" });

  const url = `https://avatar.roblox.com/v1/users/${userId}/avatars`;

  try {
    const response = await fetch(url, {
      headers: {
        "Authorization": `Bearer ${CLOUD_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: `Roblox API responded with ${response.status}`, message: text });
    }

    const data = await response.json();

    // Filter editable avatars only
    const editableAvatars = data.data.filter(a => a.isEditable);

    return res.json({ data: editableAvatars });
  } catch (err) {
    console.error("Error fetching from Roblox API:", err);
    return res.status(500).json({ error: "Failed to fetch from Roblox API" });
  }
});

app.get("/", (req, res) => {
  res.send("Roblox Avatar Proxy V2 is running!");
});

app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
