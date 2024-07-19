// backend/models/Task.js
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    task: String,
    priority: String,
    date: String,
    category: String,
    done: Boolean,
    dateAdded: String,
    dateCompleted: String,
});

module.exports = mongoose.model('Task', taskSchema);
