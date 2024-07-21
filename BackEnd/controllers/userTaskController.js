const UserTask = require('../models/UserTask');

// Get all tasks for a user
exports.getUserTasks = async (req, res) => {
    try {
        const tasks = await UserTask.find({ username: req.user.username });
        res.json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Add a new task for a user
exports.addUserTask = async (req, res) => {
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
};

// Update a task for a user
exports.updateUserTask = async (req, res) => {
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
};

// Delete a task for a user
exports.deleteUserTask = async (req, res) => {
    try {
        await UserTask.findOneAndDelete({ _id: req.params.id, username: req.user.username });
        res.json({ msg: 'Task deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};
