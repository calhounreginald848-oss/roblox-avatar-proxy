const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001; // Use a different port from your Roblox proxy

// Ping route for uptime robot
app.get('/ping', (req, res) => {
  res.send('OK');
});

app.listen(PORT, () => {
  console.log(`Ping server running on port ${PORT}`);
});
