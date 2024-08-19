const mongoose = require('mongoose');

const userCalendarTaskSchema = new mongoose.Schema({
    username: { type: String, required: true },
    title: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: false },
    time: { type: String, required: false },
    category: { type: String, required: true, enum: ['Work', 'Personal', 'Sport', 'Art', 'Others'] },
    priority: { type: String, required: true, enum: ['Low', 'Medium', 'High'] },
    description: { type: String, required: false },
    done: { type: Boolean, default: false },
    dateAdded: { type: Date, default: Date.now },
    dateCompleted: { type: Date, required: false }
});

module.exports = mongoose.model('UserCalendarTask', userCalendarTaskSchema);