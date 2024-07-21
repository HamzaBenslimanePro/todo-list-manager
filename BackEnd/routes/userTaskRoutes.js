const express = require('express');
const UserTask = require('../models/UserTask');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all tasks for a user
router.get('/usertasks', auth, async (req, res) => {
    try {
        const tasks = await UserTask.find({ username: req.user.username });
        res.json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Add a new task for a user
router.post('/usertasks', auth, async (req, res) => {
    const { task, priority, date, category } = req.body;
    const newTask = new UserTask({
        username: req.user.username,
        task,
        priority,
        date,
        category,
        done: false,
        dateAdded: new Date().toISOString().split('T')[0],
        dateCompleted: null
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
router.put('/usertasks/:id', auth, async (req, res) => {
    try {
        const updatedTask = await UserTask.findOneAndUpdate(
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
router.delete('/usertasks/:id', auth, async (req, res) => {
    try {
        await UserTask.findOneAndDelete({ _id: req.params.id, username: req.user.username });
        res.json({ msg: 'Task deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
