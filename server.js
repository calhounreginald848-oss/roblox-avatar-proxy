// server.js
const express = require('express');
const fetch = require('node-fetch'); // make sure node-fetch is in package.json

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory cache
const avatarCache = new Map(); // key: userId, value: {data, timestamp}
// Cooldown tracker
const cooldowns = new Map(); // key: userId, value: timestamp
// Queue to avoid flooding Roblox API
const queue = [];
let processing = false;

// Config
const CACHE_TIME = 30_000; // 30 seconds cache
const COOLDOWN_TIME = 10_000; // 10 seconds per user
const ASSET_DELAY = 200; // ms between asset requests

// Helper functions
function getCachedAvatar(userId) {
    const cache = avatarCache.get(userId);
    if (cache && (Date.now() - cache.timestamp < CACHE_TIME)) {
        return cache.data;
    }
    return null;
}

function setCachedAvatar(userId, data) {
    avatarCache.set(userId, { data, timestamp: Date.now() });
}

function canRequest(userId) {
    const last = cooldowns.get(userId);
    if (last && (Date.now() - last < COOLDOWN_TIME)) {
        return false;
    }
    cooldowns.set(userId, Date.now());
    return true;
}

// Sequential asset fetching to avoid hitting rate limits
async function fetchAssetsSequentially(assets) {
    const results = [];
    for (const asset of assets) {
        try {
            const res = await fetch(asset.url);
            if (!res.ok) continue;
            results.push(await res.json());
            await new Promise(r => setTimeout(r, ASSET_DELAY));
        } catch (err) {
            console.warn(`Failed to fetch asset ${asset.url}: ${err.message}`);
        }
    }
    return results;
}

// Queue system
async function processQueue() {
    if (processing || queue.length === 0) return;
    processing = true;
    const { userId, resolve } = queue.shift();
    try {
        const data = await fetchAvatar(userId);
        resolve(data);
    } catch (err) {
        resolve({ error: err.message });
    }
    processing = false;
    processQueue();
}

function requestAvatar(userId) {
    return new Promise(resolve => {
        queue.push({ userId, resolve });
        processQueue();
    });
}

// Main avatar fetch function
async function fetchAvatar(userId) {
    // Check cache
    const cached = getCachedAvatar(userId);
    if (cached) return cached;

    // Cooldown check
    if (!canRequest(userId)) {
        return { error: 'Cooldown active. Try again later.' };
    }

    // Roblox API call
    const url = `https://avatar.roblox.com/v2/avatar/users/${userId}/outfits`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to fetch outfits: ${res.status}`);
    }
    const data = await res.json();

    // Optional: fetch assets sequentially here if needed
    // const detailedAssets = await fetchAssetsSequentially(data.assets || []);

    setCachedAvatar(userId, data);
    return data;
}

// Routes
app.get('/', (req, res) => res.send('Proxy is running!'));

app.get('/avatar/:userId', async (req, res) => {
    const userId = req.params.userId;
    try {
        const avatarData = await requestAvatar(userId);
        res.json(avatarData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
