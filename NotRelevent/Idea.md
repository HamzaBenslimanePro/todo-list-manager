Implementing user login functionality typically involves having a separate collection in MongoDB to store user information (e.g., usernames, email addresses, hashed passwords). Each user will not have their own separate collection; instead, all user data will be stored in a single collection, and tasks or other data will reference the user to whom they belong.

Here’s how you can structure this:

1. **Users Collection**: Store user information.
2. **Tasks Collection**: Store tasks with a reference to the user who created them.

### Step-by-Step Implementation

1. **Set Up User Model and Authentication**:
    - Create a user model.
    - Implement user registration and login routes.
    - Use JWT (JSON Web Tokens) for authentication.

2. **Associate Tasks with Users**:
    - Modify the task model to include a reference to the user.
    - Ensure task routes require authentication.

### Step 1: Set Up User Model and Authentication

**models/User.js**:
```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Hash password before saving the user
userSchema.pre('save', async function(next) {
    if (this.isModified('password') || this.isNew) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
```

**routes/authRoutes.js**:
```javascript
const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ username, email, password });
        await user.save();
        res.status(201).send({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).send({ error: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).send({ error: 'Invalid email or password' });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.send({ token });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

module.exports = router;
```

**middleware/auth.js**:
```javascript
const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const token = req.header('Authorization');
    if (!token) return res.status(401).send({ error: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (ex) {
        res.status(400).send({ error: 'Invalid token.' });
    }
};
```

### Step 2: Associate Tasks with Users

**models/Task.js**:
```javascript
const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    task: String,
    priority: String,
    date: String,
    category: String,
    done: Boolean,
    dateAdded: String,
    dateCompleted: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Reference to the user
});

module.exports = mongoose.model('Task', taskSchema);
```

**routes/taskRoutes.js**:
```javascript
const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all tasks for the logged-in user
router.get('/tasks', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user.userId });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a new task
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({ ...req.body, userId: req.user.userId });
    try {
        const newTask = await task.save();
        res.status(201).json(newTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a task
router.put('/tasks/:id', auth, async (req, res) => {
    try {
        const updatedTask = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.userId },
            req.body,
            { new: true }
        );
        res.json(updatedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a task
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
        res.json({ message: 'Task deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
```

### Step 3: Integrate Routes into the Server

**server.js**:
```javascript
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes'); // Import task routes
const path = require('path');
dotenv.config();
const app = express();
const cors = require('cors');

app.use(cors());
// Middleware
app.use(express.json()); // For parsing application/json

// Routes
app.use('/api', authRoutes);
app.use('/api', taskRoutes); // Add task routes

// Serve static files from the frontend
app.use(express.static(path.join(__dirname, '../'))); // Adjust path as needed

// Catch-all route to serve index.html for any other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html')); // Adjust path as needed
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB Atlas');
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch(err => console.error('MongoDB connection error:', err));
```

### Step 4: Update Frontend to Use Authentication

1. **Add Registration and Login Forms**:
2. **Store JWT Token**:
3. **Send JWT Token with Requests**:

Here is a simplified example of how to modify the frontend to include authentication.

**auth.js** (Frontend Authentication):

```javascript
async function register(username, email, password) {
    const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
    });
    const data = await response.json();
    console.log(data);
}

async function login(email, password) {
    const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (data.token) {
        localStorage.setItem('token', data.token);
        console.log('Login successful');
    } else {
        console.log('Login failed');
    }
}

function getToken() {
    return localStorage.getItem('token');
}

function logout() {
    localStorage.removeItem('token');
    console.log('Logged out');
}
```

**app.js** (Include Token in Requests):

```javascript
async function fetchTasks() {
    const response = await fetch('http://localhost:5000/api/tasks', {
        headers: { 'Authorization': getToken() }
    });
    tasks = await response.json();
    renderTasks();
}

// Function to add a new task
async function addTask(task, priority, date, category) {
    const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': getToken()
        },
        body: JSON.stringify({
            task,
            priority,
            date,
            category,
            done: false,
            dateAdded: new Date().toISOString().split('T')[0],
            dateCompleted: null
        })
    });
    const newTask = await response.json();
    tasks.push(newTask);
    renderTasks();
}

// Similar updates for editTask, deleteTask, and toggleTaskDone functions
```

### Summary

1. **Create User and Task Models**: Use separate collections

 for users and tasks, with tasks referencing users.
2. **Implement Authentication**: Use JWT for authentication, protecting task routes.
3. **Update Frontend**: Include registration and login forms, and send the JWT token with requests.

By following these steps, you can create a login functionality and associate tasks with specific users, ensuring each user only accesses their own tasks.