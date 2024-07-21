const mongoose = require('mongoose');

const userTaskSchema = new mongoose.Schema({
    username: { type: String, required: true },
    task: String,
    priority: String,
    date: String,
    category: String,
    done: Boolean,
    dateAdded: String,
    dateCompleted: String
});

module.exports = mongoose.model('UserTask', userTaskSchema);
