// backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // For parsing application/json

// Routes
app.use('/api', authRoutes);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://user1:o8kaL3fUeu4BTN9m@cluster0.mongodb.net/mydb-test?retryWrites=true&w=majority', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
    })
    .then(() => {
        console.log('Connected to MongoDB Atlas');
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch(err => console.error('MongoDB connection error:', err));
