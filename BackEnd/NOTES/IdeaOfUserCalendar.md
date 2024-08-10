# First Take

To create a new route `userCalendarTaskRoutes.js` with its special model and update `server.js`, follow these steps:

### 1. Create the `UserCalendarTask` model

First, create a new model for `UserCalendarTask`.

#### models/UserCalendarTask.js

```javascript
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
```

### 2. Create the `userCalendarTaskRoutes.js` file

Create a new route file to handle the user calendar tasks.

#### routes/userCalendarTaskRoutes.js

```javascript
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
    const { title, start, end, time, category, description, priority } = req.body;
    const newTask = new UserCalendarTask({
        username: req.user.username,
        title,
        start,
        end,
        time,
        category,
        description,
        priority,
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
```

### 3. Update `server.js`

Update `server.js` to include the new route.

#### server.js

```javascript
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const userTaskRoutes = require('./routes/userTaskRoutes');
const userCalendarTaskRoutes = require('./routes/userCalendarTaskRoutes'); // Import the new routes
const path = require('path');
dotenv.config();
const app = express();
const cors = require('cors');

app.use(cors());
// Middleware
app.use(express.json()); // For parsing application/json

// Routes
app.use('/api', authRoutes);
app.use('/api', userTaskRoutes);
app.use('/api', userCalendarTaskRoutes); // Use the new routes

// Serve static files from the frontend
app.use(express.static(path.join(__dirname, '../')));

// Catch-all route to serve index.html for any other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB Atlas');
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch(err => console.error('MongoDB connection error:', err));
```

### 4. Update Frontend

Update your frontend to work with the new API endpoints.

#### UserCalendar.html

Ensure the import tasks button and file input are set up properly.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Calendar</title>
    <link rel="stylesheet" href="path/to/fullcalendar/main.min.css">
    <link rel="stylesheet" href="path/to/your/custom/styles.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="path/to/fullcalendar/main.min.js"></script>
</head>
<body>
    <header>
        <h1 id="username">Welcome, User</h1>
        <button id="importTasksBtn">Import Tasks</button>
        <input type="file" id="taskFileInput" style="display: none;">
    </header>
    <div id="calendar"></div>

    <!-- Task Modal -->
    <div id="taskModal" style="display: none;">
        <div>
            <span class="close">&times;</span>
            <h2 id="modalTitle">Add Task</h2>
            <form id="taskForm">
                <label for="startDate">Start Date</label>
                <input type="date" id="startDate" required>
                <label for="endDate">End Date</label>
                <input type="date" id="endDate">
                <label for="taskTitle">Task Title</label>
                <input type="text" id="taskTitle" required>
                <label for="taskTime">Task Time</label>
                <input type="time" id="taskTime">
                <label for="taskCategory">Category</label>
                <select id="taskCategory">
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="sport">Sport</option>
                    <option value="art">Art</option>
                    <option value="others">Others</option>
                </select>
                <label for="taskDescription">Description</label>
                <textarea id="taskDescription"></textarea>
                <label for="taskPriority">Priority</label>
                <select id="taskPriority">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
                <button type="submit">Save Task</button>
            </form>
            <button id="deleteTaskBtn" style="display: none;">Delete Task</button>
        </div>
    </div>

    <!-- Confirm Modal -->
    <div id="confirmModal" style="display: none;">
        <div>
            <span class="close">&times;</span>
            <p id="confirmModalMessage"></p>
            <button id="confirmCreateTasksBtn">Create Tasks</button>
        </div>
    </div>

    <script src="path/to/your/userCalendar.js"></script>
</body>
</html>
```

#### userCalendar.js

Update the `userCalendar.js` to use the new API routes.

```javascript
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'login.html';
}

const calendarEl = document.getElementById('calendar');
const taskModal = document.getElementById('taskModal');
const confirmModal = document.getElementById('confirmModal');
const taskForm = document.getElementById('taskForm');
const closeBtns = document.querySelectorAll('.close');
const deleteTaskBtn = document.getElementById('deleteTaskBtn');
const confirmCreateTasksBtn = document.getElementById('confirmCreateTasksBtn');
const importTasksBtn

 = document.getElementById('importTasksBtn');
const taskFileInput = document.getElementById('taskFileInput');

let currentEventId = null;
let tasksToCreate = [];

// Fetch user details
async function fetchUser() {
    try {
        const response = await fetch('http://localhost:5000/api/user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch user details');
        const user = await response.json();
        document.getElementById('username').innerText = `Welcome, ${user.username}`;
    } catch (error) {
        console.error('Error fetching user:', error);
        window.location.href = 'login.html';
    }
}

// Fetch user tasks
async function fetchTasks() {
    try {
        const response = await fetch('http://localhost:5000/api/usercalendartasks', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

// Initialize FullCalendar
const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    editable: true,
    selectable: true,
    dateClick: function(info) {
        currentEventId = null;
        openTaskModal(info.dateStr);
    },
    eventClick: function(info) {
        currentEventId = info.event.id;
        openTaskModal(info.event.startStr.split('T')[0], info.event);
    },
    eventDidMount: function(info) {
        $(info.el).tooltip({
            title: getTooltipContent(info.event),
            html: true,
            placement: 'top',
            trigger: 'hover',
            container: 'body'
        });
    }
});

calendar.render();

// Render tasks on the calendar
function renderTasks(tasks) {
    calendar.removeAllEvents();
    tasks.forEach(task => calendar.addEvent(task));
}

// Open task modal for adding/editing tasks
function openTaskModal(dateStr, event = null) {
    taskModal.style.display = 'block';
    if (event) {
        document.getElementById('modalTitle').innerText = 'Edit Task';
        document.getElementById('startDate').value = event.startStr.split('T')[0];
        document.getElementById('endDate').value = event.endStr ? event.endStr.split('T')[0] : '';
        document.getElementById('taskTitle').value = event.title.split(' (')[0];
        document.getElementById('taskTime').value = event.startStr.split('T')[1] ? event.startStr.split('T')[1] : '';
        document.getElementById('taskCategory').value = event.extendedProps.category;
        document.getElementById('taskDescription').value = event.extendedProps.description;
        document.getElementById('taskPriority').value = event.extendedProps.priority;
        deleteTaskBtn.style.display = 'block';
    } else {
        document.getElementById('modalTitle').innerText = 'Add Task';
        document.getElementById('startDate').value = dateStr;
        document.getElementById('endDate').value = '';
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskTime').value = '';
        document.getElementById('taskCategory').value = 'work';
        document.getElementById('taskDescription').value = '';
        document.getElementById('taskPriority').value = 'low';
        deleteTaskBtn.style.display = 'none';
    }
}

// Close modals when clicking on the 'x' button
closeBtns.forEach(btn => {
    btn.onclick = function () {
        taskModal.style.display = 'none';
        confirmModal.style.display = 'none';
    };
});

// Close modals when clicking outside of the modal
window.onclick = function (event) {
    if (event.target == taskModal) {
        taskModal.style.display = 'none';
    } else if (event.target == confirmModal) {
        confirmModal.style.display = 'none';
    }
};

// Handle task form submission
taskForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    const title = document.getElementById('taskTitle').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const time = document.getElementById('taskTime').value;
    const category = document.getElementById('taskCategory').value;
    const description = document.getElementById('taskDescription').value;
    const priority = document.getElementById('taskPriority').value;

    const taskEvent = {
        id: currentEventId || String(Date.now()),
        title: `${title} (${priority})`,
        start: time ? `${startDate}T${time}` : startDate,
        end: endDate ? endDate : null,
        allDay: !time,
        backgroundColor: getPriorityColor(priority),
        borderColor: getPriorityColor(priority),
        extendedProps: {
            description,
            priority,
            category
        }
    };

    try {
        if (currentEventId) {
            // Update existing event
            const response = await fetch(`http://localhost:5000/api/usercalendartasks/${currentEventId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(taskEvent)
            });
            if (!response.ok) throw new Error('Failed to update task');
        } else {
            // Add new event
            const response = await fetch('http://localhost:5000/api/usercalendartasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(taskEvent)
            });
            if (!response.ok) throw new Error('Failed to add task');
        }

        fetchTasks();

        // Close modal and reset form
        taskModal.style.display = 'none';
        taskForm.reset();
    } catch (error) {
        console.error('Error saving task:', error);
    }
});

// Handle task deletion
deleteTaskBtn.addEventListener('click', async function () {
    if (currentEventId) {
        try {
            const response = await fetch(`http://localhost:5000/api/usercalendartasks/${currentEventId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to delete task');

            fetchTasks();

            // Close modal and reset form
            taskModal.style.display = 'none';
            taskForm.reset();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    }
});

// Function to get the color based on priority
function getPriorityColor(priority) {
    switch (priority) {
        case 'high':
            return '#ff0000'; // Red
        case 'medium':
            return '#ffa500'; // Orange
        case 'low':
            return '#008000'; // Green
        default:
            return '#0000ff'; // Blue
    }
}

// Handle task file import
importTasksBtn.addEventListener('click', function () {
    taskFileInput.click();
});

taskFileInput.addEventListener('change', async function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('taskFile', file);

    try {
        const response = await fetch('/api/import-tasks', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Failed to import tasks');

        const result = await response.json();
        tasksToCreate = result.tasks;
        console.log(`Read ${tasksToCreate.length} tasks from the file.`);

        const message = `Read ${tasksToCreate.length} tasks from the file. Do you want to create them?`;
        document.getElementById('confirmModalMessage').innerText = message;
        confirmModal.style.display = 'block';

    } catch (error) {
        console.error('Error importing tasks:', error);
    }
});

// Handle task creation confirmation
confirmCreateTasksBtn.addEventListener('click', async function () {
    console.log(`Creating ${tasksToCreate.length} tasks...`); // Debugging
    try {
        const response = await fetch('/api/usercalendartasks/batch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ tasks: tasksToCreate })
        });
        if (!response.ok) throw new Error('Failed to create tasks');
        fetchTasks();
        confirmModal.style.display = 'none';
    } catch (error) {
        console.error('Error creating tasks:', error);
    }
});

function getTooltipContent(event) {
    return `<strong>Task:</strong> ${event.title}<br>
            <strong>Description:</strong> ${event.extendedProps.description}<br>
            <strong>Start Date:</strong> ${event.start.toLocaleDateString()}<br>
            ${event.allDay ? '' : `<strong>Time:</strong> ${event.start.toLocaleTimeString()}<br>`}
            ${event.end ? `<strong>End Date:</strong> ${

event.end.toLocaleDateString()}<br>` : ''}
            <strong>Priority:</strong> ${event.extendedProps.priority}<br>
            <strong>Category:</strong> ${event.extendedProps.category}`;
}

// Initial fetches
fetchUser();
fetchTasks();
```

### 5. Ensure CORS configuration

Ensure your backend `server.js` is properly set up to handle CORS for all your API routes:

```javascript
const corsOptions = {
    origin: 'http://localhost:3000', // Replace with your frontend URL
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

By following these steps, you should have a user-specific calendar page where tasks are fetched and saved in MongoDB Atlas, with all the required features such as task filtering, editing, and deleting.

# Second Take

To add the functionality of marking tasks as done and setting the `dateCompleted` in the `UserCalendarTask` model, we need to:

1. Add a checkbox in the task modal to mark the task as done.
2. Update the task form submission to include the `done` and `dateCompleted` properties.
3. Update the rendering logic to show the tasks' completion status.
4. Handle the task completion in the backend.

### 1. Update the Task Modal

Add a checkbox in the task modal for marking the task as done.

#### UserCalendar.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Calendar</title>
    <link rel="stylesheet" href="path/to/fullcalendar/main.min.css">
    <link rel="stylesheet" href="path/to/your/custom/styles.css">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="path/to/fullcalendar/main.min.js"></script>
</head>
<body>
    <header>
        <h1 id="username">Welcome, User</h1>
        <button id="importTasksBtn">Import Tasks</button>
        <input type="file" id="taskFileInput" style="display: none;">
    </header>
    <div id="calendar"></div>

    <!-- Task Modal -->
    <div id="taskModal" style="display: none;">
        <div>
            <span class="close">&times;</span>
            <h2 id="modalTitle">Add Task</h2>
            <form id="taskForm">
                <label for="startDate">Start Date</label>
                <input type="date" id="startDate" required>
                <label for="endDate">End Date</label>
                <input type="date" id="endDate">
                <label for="taskTitle">Task Title</label>
                <input type="text" id="taskTitle" required>
                <label for="taskTime">Task Time</label>
                <input type="time" id="taskTime">
                <label for="taskCategory">Category</label>
                <select id="taskCategory">
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="sport">Sport</option>
                    <option value="art">Art</option>
                    <option value="others">Others</option>
                </select>
                <label for="taskDescription">Description</label>
                <textarea id="taskDescription"></textarea>
                <label for="taskPriority">Priority</label>
                <select id="taskPriority">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
                <label for="taskDone">Done</label>
                <input type="checkbox" id="taskDone">
                <button type="submit">Save Task</button>
            </form>
            <button id="deleteTaskBtn" style="display: none;">Delete Task</button>
        </div>
    </div>

    <!-- Confirm Modal -->
    <div id="confirmModal" style="display: none;">
        <div>
            <span class="close">&times;</span>
            <p id="confirmModalMessage"></p>
            <button id="confirmCreateTasksBtn">Create Tasks</button>
        </div>
    </div>

    <script src="path/to/your/userCalendar.js"></script>
</body>
</html>
```

### 2. Update the Task Form Submission

Update the task form submission to include the `done` and `dateCompleted` properties.

#### userCalendar.js

```javascript
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = 'login.html';
}

const calendarEl = document.getElementById('calendar');
const taskModal = document.getElementById('taskModal');
const confirmModal = document.getElementById('confirmModal');
const taskForm = document.getElementById('taskForm');
const closeBtns = document.querySelectorAll('.close');
const deleteTaskBtn = document.getElementById('deleteTaskBtn');
const confirmCreateTasksBtn = document.getElementById('confirmCreateTasksBtn');
const importTasksBtn = document.getElementById('importTasksBtn');
const taskFileInput = document.getElementById('taskFileInput');

let currentEventId = null;
let tasksToCreate = [];

// Fetch user details
async function fetchUser() {
    try {
        const response = await fetch('http://localhost:5000/api/user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch user details');
        const user = await response.json();
        document.getElementById('username').innerText = `Welcome, ${user.username}`;
    } catch (error) {
        console.error('Error fetching user:', error);
        window.location.href = 'login.html';
    }
}

// Fetch user tasks
async function fetchTasks() {
    try {
        const response = await fetch('http://localhost:5000/api/usercalendartasks', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const tasks = await response.json();
        renderTasks(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

// Initialize FullCalendar
const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth',
    editable: true,
    selectable: true,
    dateClick: function(info) {
        currentEventId = null;
        openTaskModal(info.dateStr);
    },
    eventClick: function(info) {
        currentEventId = info.event.id;
        openTaskModal(info.event.startStr.split('T')[0], info.event);
    },
    eventDidMount: function(info) {
        $(info.el).tooltip({
            title: getTooltipContent(info.event),
            html: true,
            placement: 'top',
            trigger: 'hover',
            container: 'body'
        });
    }
});

calendar.render();

// Render tasks on the calendar
function renderTasks(tasks) {
    calendar.removeAllEvents();
    tasks.forEach(task => calendar.addEvent(task));
}

// Open task modal for adding/editing tasks
function openTaskModal(dateStr, event = null) {
    taskModal.style.display = 'block';
    if (event) {
        document.getElementById('modalTitle').innerText = 'Edit Task';
        document.getElementById('startDate').value = event.startStr.split('T')[0];
        document.getElementById('endDate').value = event.endStr ? event.endStr.split('T')[0] : '';
        document.getElementById('taskTitle').value = event.title.split(' (')[0];
        document.getElementById('taskTime').value = event.startStr.split('T')[1] ? event.startStr.split('T')[1] : '';
        document.getElementById('taskCategory').value = event.extendedProps.category;
        document.getElementById('taskDescription').value = event.extendedProps.description;
        document.getElementById('taskPriority').value = event.extendedProps.priority;
        document.getElementById('taskDone').checked = event.extendedProps.done;
        deleteTaskBtn.style.display = 'block';
    } else {
        document.getElementById('modalTitle').innerText = 'Add Task';
        document.getElementById('startDate').value = dateStr;
        document.getElementById('endDate').value = '';
        document.getElementById('taskTitle').value = '';
        document.getElementById('taskTime').value = '';
        document.getElementById('taskCategory').value = 'work';
        document.getElementById('taskDescription').value = '';
        document.getElementById('taskPriority').value = 'low';
        document.getElementById('taskDone').checked = false;
        deleteTaskBtn.style.display = 'none';
    }
}

// Close modals when clicking on the 'x' button
closeBtns.forEach(btn => {
    btn.onclick = function () {
        taskModal.style.display = 'none';
        confirmModal.style.display = 'none';
    };
});

// Close modals when clicking outside of the modal
window.onclick = function (event) {
    if (event.target == taskModal) {
        taskModal.style.display = 'none';
    } else if (event.target == confirmModal) {
        confirmModal.style.display = 'none';
    }
};

// Handle task form submission
taskForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    const title = document.getElementById('taskTitle').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const time = document.getElementById('taskTime').value;
    const category = document.getElementById('taskCategory').value;
    const description = document.getElementById('taskDescription').value;
    const priority = document.getElementById('taskPriority').value;
    const done = document.getElementById('taskDone').checked;
    const dateCompleted = done ? new Date().toISOString().split('T')[0] : null;

    const taskEvent =

 {
        id: currentEventId || String(Date.now()),
        title: `${title} (${priority})`,
        start: time ? `${startDate}T${time}` : startDate,
        end: endDate ? endDate : null,
        allDay: !time,
        backgroundColor: getPriorityColor(priority),
        borderColor: getPriorityColor(priority),
        extendedProps: {
            description,
            priority,
            category,
            done,
            dateCompleted
        }
    };

    try {
        if (currentEventId) {
            // Update existing event
            const response = await fetch(`http://localhost:5000/api/usercalendartasks/${currentEventId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(taskEvent)
            });
            if (!response.ok) throw new Error('Failed to update task');
        } else {
            // Add new event
            const response = await fetch('http://localhost:5000/api/usercalendartasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(taskEvent)
            });
            if (!response.ok) throw new Error('Failed to add task');
        }

        fetchTasks();

        // Close modal and reset form
        taskModal.style.display = 'none';
        taskForm.reset();
    } catch (error) {
        console.error('Error saving task:', error);
    }
});

// Handle task deletion
deleteTaskBtn.addEventListener('click', async function () {
    if (currentEventId) {
        try {
            const response = await fetch(`http://localhost:5000/api/usercalendartasks/${currentEventId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to delete task');

            fetchTasks();

            // Close modal and reset form
            taskModal.style.display = 'none';
            taskForm.reset();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    }
});

// Function to get the color based on priority
function getPriorityColor(priority) {
    switch (priority) {
        case 'high':
            return '#ff0000'; // Red
        case 'medium':
            return '#ffa500'; // Orange
        case 'low':
            return '#008000'; // Green
        default:
            return '#0000ff'; // Blue
    }
}

// Handle task file import
importTasksBtn.addEventListener('click', function () {
    taskFileInput.click();
});

taskFileInput.addEventListener('change', async function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('taskFile', file);

    try {
        const response = await fetch('/api/import-tasks', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Failed to import tasks');

        const result = await response.json();
        tasksToCreate = result.tasks;
        console.log(`Read ${tasksToCreate.length} tasks from the file.`);

        const message = `Read ${tasksToCreate.length} tasks from the file. Do you want to create them?`;
        document.getElementById('confirmModalMessage').innerText = message;
        confirmModal.style.display = 'block';

    } catch (error) {
        console.error('Error importing tasks:', error);
    }
});

// Handle task creation confirmation
confirmCreateTasksBtn.addEventListener('click', async function () {
    console.log(`Creating ${tasksToCreate.length} tasks...`); // Debugging
    try {
        const response = await fetch('/api/usercalendartasks/batch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ tasks: tasksToCreate })
        });
        if (!response.ok) throw new Error('Failed to create tasks');
        fetchTasks();
        confirmModal.style.display = 'none';
    } catch (error) {
        console.error('Error creating tasks:', error);
    }
});

function getTooltipContent(event) {
    return `<strong>Task:</strong> ${event.title}<br>
            <strong>Description:</strong> ${event.extendedProps.description}<br>
            <strong>Start Date:</strong> ${event.start.toLocaleDateString()}<br>
            ${event.allDay ? '' : `<strong>Time:</strong> ${event.start.toLocaleTimeString()}<br>`}
            ${event.end ? `<strong>End Date:</strong> ${event.end.toLocaleDateString()}<br>` : ''}
            <strong>Priority:</strong> ${event.extendedProps.priority}<br>
            <strong>Category:</strong> ${event.extendedProps.category}`;
}

// Initial fetches
fetchUser();
fetchTasks();
```

### 3. Backend Modifications

Ensure the backend supports these updates, particularly for the new properties `done` and `dateCompleted`.

#### routes/userCalendarTaskRoutes.js

```javascript
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
```

### 4. Update `server.js`

Ensure `server.js` includes the new route.

```javascript
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const userTaskRoutes = require('./routes/userTaskRoutes');
const userCalendarTaskRoutes = require('./routes/userCalendarTaskRoutes');
const path = require('path');
dotenv.config();
const app = express();
const cors = require('cors');

app.use(cors());
// Middleware
app.use(express.json()); // For parsing application/json

// Routes
app.use('/api', authRoutes);
app.use('/api', userTaskRoutes);
app.use('/api', userCalendarTaskRoutes); // Use the new routes

// Serve static files from the frontend
app.use(express.static(path.join(__dirname, '../')));

// Catch-all route to serve index.html for any other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB Atlas');
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch(err => console.error('MongoDB connection error:', err));
```

By following these steps, you ensure that tasks can be marked

 as done, with `dateCompleted` set appropriately, and integrate this feature seamlessly into your user-specific calendar application.