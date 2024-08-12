const express = require('express');
const UserCalendarTask = require('../models/UserCalendarTask');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all tasks for a user
router.get('/usercalendartasks', auth, async (req, res) => {
    try {
        const tasks = await UserCalendarTask.find({ username: req.user.username });
        res.json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Add a new task for a user
router.post('/usercalendartasks', auth, async (req, res) => {
    const { title, start, end, time, category, description, priority, done, dateCompleted } = req.body;
    const newTask = new UserCalendarTask({
        username: req.user.username,
        title,
        start,
        end,
        time,
        category,
        description,
        priority,
        done,
        dateAdded: new Date().toISOString().split('T')[0],
        dateCompleted: done ? dateCompleted : null
    });

    try {
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Update a task for a user
router.put('/usercalendartasks/:id', auth, async (req, res) => {
    try {
        const updatedTask = await UserCalendarTask.findOneAndUpdate(
            { _id: req.params.id, username: req.user.username },
            req.body,
            { new: true }
        );
        res.json(updatedTask);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Delete a task for a user
router.delete('/usercalendartasks/:id', auth, async (req, res) => {
    try {
        await UserCalendarTask.findOneAndDelete({ _id: req.params.id, username: req.user.username });
        res.json({ msg: 'Task deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Batch import tasks for a user
router.post('/usercalendartasks/batch', auth, async (req, res) => {
    const tasks = req.body.tasks.map(task => ({
        ...task,
        username: req.user.username,
        dateAdded: new Date().toISOString().split('T')[0]
    }));

    try {
        const savedTasks = await UserCalendarTask.insertMany(tasks);
        res.status(201).json(savedTasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;