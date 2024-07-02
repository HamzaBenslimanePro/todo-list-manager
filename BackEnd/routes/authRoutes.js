// backend/routes/authRoutes.js

const express = require('express');
const { signup, login, createTask, deleteTask, getTasks } = require('../controllers/authController');

const router = express.Router();

// User routes
router.post('/signup', signup);
router.post('/login', login);

// ToDo routes
router.post('/tasks', checkAuth, createTask);
router.delete('/tasks/:id', checkAuth, deleteTask);
router.get('/tasks', checkAuth, getTasks);

module.exports = router;
