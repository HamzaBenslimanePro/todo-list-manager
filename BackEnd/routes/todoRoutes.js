const express = require('express');
const { checkAuth } = require('../middleware/authMiddleware');
const Todo = require('../models/Todo');

const router = express.Router();

// Get all todos for the authenticated user
router.get('/todos', checkAuth, async (req, res) => {
    try {
        const todos = await Todo.find({ userId: req.user.userId });
        res.json(todos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create a new todo for the authenticated user
router.post('/todos', checkAuth, async (req, res) => {
    const { title } = req.body;

    try {
        const newTodo = new Todo({
            userId: req.user.userId,
            title,
        });

        const savedTodo = await newTodo.save();
        res.status(201).json(savedTodo);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete a todo by ID for the authenticated user
router.delete('/todos/:id', checkAuth, async (req, res) => {
    try {
        await Todo.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
        res.status(200).json({ message: 'Todo deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
