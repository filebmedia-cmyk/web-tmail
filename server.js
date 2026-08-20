const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

const API_BASE = "https://flatimostore.biz.id";

// Endpoint to fetch inbox
app.get('/api/inbox', async (req, res) => {
    try {
        const address = req.query.address;
        if (!address) {
            return res.status(400).json({ error: "Address is required" });
        }

        const targetUrl = `${API_BASE}/api/inbox?address=${encodeURIComponent(address)}`;
        const response = await axios.get(targetUrl);
        res.json(response.data);
    } catch (error) {
        console.error("Inbox Fetch Error:", error.message);
        res.status(500).json({ error: "Failed to fetch from target server" });
    }
});

// Endpoint to fetch specific email content
app.get('/api/download', async (req, res) => {
    try {
        const { address, emailId, type } = req.query;
        if (!address || !emailId) {
            return res.status(400).json({ error: "Missing parameters" });
        }

        const targetUrl = `${API_BASE}/api/download?address=${encodeURIComponent(address)}&emailId=${encodeURIComponent(emailId)}&type=${encodeURIComponent(type || 'email')}`;
        const response = await axios.get(targetUrl);
        
        if (typeof response.data === 'object') {
            res.json(response.data);
        } else {
            res.send(response.data);
        }
    } catch (error) {
        console.error("Download Fetch Error:", error.message);
        res.status(500).json({ error: "Failed to fetch email content" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`=====================================`);
    console.log(`CYBER MAIL OTP - VPS SERVER ACTIVE`);
    console.log(`Server running at: http://localhost:${PORT}`);
    console.log(`=====================================`);
});
