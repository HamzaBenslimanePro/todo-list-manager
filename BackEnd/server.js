// backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const path = require('path'); // Add this for serving static files

dotenv.config();

const app = express();

const cors = require('cors');
app.use(cors());
// Middleware
app.use(express.json()); // For parsing application/json

// Routes
app.use('/api', authRoutes);

// Serve static files from the frontend
app.use(express.static(path.join(__dirname, '../frontend'))); // Adjust path as needed

// Catch-all route to serve index.html for any other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html')); // Adjust path as needed
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB Atlas');
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch(err => console.error('MongoDB connection error:', err));
