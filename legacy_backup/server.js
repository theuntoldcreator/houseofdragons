const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'listings.json');

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Config Endpoint for Frontend (Supabase)
app.get('/api/config', (req, res) => {
    res.json({
        supabaseUrl: process.env.db_url,
        supabaseKey: process.env.anon_key
    });
});

// Helper to read data
const readData = () => {
    if (!fs.existsSync(DATA_FILE)) {
        return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data || '[]');
};

// Helper to write data
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// API: Get all listings
app.get('/api/listings', (req, res) => {
    const listings = readData();
    res.json(listings);
});

// API: Post a new listing
app.post('/api/listings', (req, res) => {
    const listings = readData();
    const newListing = { ...req.body, id: Date.now(), postedDate: new Date().toISOString() };
    listings.push(newListing);
    writeData(listings);
    res.status(201).json(newListing);
});


// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

