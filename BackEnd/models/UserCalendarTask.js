const mongoose = require('mongoose');

const userCalendarTaskSchema = new mongoose.Schema({
    username: { type: String, required: true },
    title: { type: String, required: true },
    start: { type: Date, required: true },
    end: { type: Date, required: false },
    time: { type: String, required: false },
    category: { type: String, required: true, enum: ['work', 'personal', 'sport', 'art', 'others'] },
    description: { type: String, required: false },
    priority: { type: String, required: true, enum: ['low', 'medium', 'high'] },
    done: { type: Boolean, default: false },
    dateAdded: { type: Date, default: Date.now },
    dateCompleted: { type: Date, required: false }
});

module.exports = mongoose.model('UserCalendarTask', userCalendarTaskSchema);