// Global variables
let tasks = [];
const token = localStorage.getItem('token');

// Element references
const usernameHeader = document.getElementById('username');
const logoutButton = document.getElementById('logoutButton');
const taskForm = document.getElementById('taskFormElement');
const taskList = document.getElementById('tasks');
const filterPriority = document.getElementById('filterPriority');
const filterCategory = document.getElementById('filterCategory');
const filterDate = document.getElementById('filterDate');
const orderTasksSelect = document.getElementById('orderTasks');

// Redirect if no token
if (!token) {
    window.location.href = 'redirect.html';
}

// Fetch user details
async function fetchUser() {
    try {
        const response = await fetch('http://localhost:5000/api/tasksUser', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch user details');
        const user = await response.json();
        usernameHeader.innerText = `Welcome, ${user.username}`;
        console.log('username :' ,user);
    } catch (error) {
        console.error('Error fetching user:', error);
        localStorage.removeItem('token');
        window.location.href = 'redirect.html';
    }
}

// Fetch user tasks
async function fetchTasks() {
    try {
        const response = await fetch('http://localhost:5000/api/usertasks', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) throw new Error('Failed to fetch tasks');
        tasks = await response.json();
        if (!Array.isArray(tasks)) throw new Error('Tasks is not an array');
        renderTasks(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

// Function to get status of task
function getStatus(task) {
    const currentDate = new Date().toISOString().split('T')[0];

    if (!task.done && task.date >= currentDate) {
        return 'In Process';
    } else if (task.done && task.date >= currentDate) {
        return 'Done';
    } else if (task.done && task.date < currentDate) {
        return 'Done Late';
    } else if (!task.done && task.date < currentDate) {
        return 'Late';
    }
    return '';
}

// Function to order tasks
function orderTasks(tasks) {
    const order = orderTasksSelect.value;

    tasks.sort((a, b) => {
        if (order === 'date') {
            return new Date(a.date) - new Date(b.date);
        } else if (order === 'priority') {
            const priorities = { low: 0, medium: 1, high: 2 };
            return priorities[a.priority] - priorities[b.priority];
        } else if (order === 'alphabetical') {
            return a.task.localeCompare(b.task);
        }
        return 0;
    });

    return tasks;
}

// Function to filter tasks
function filterTasks() {
    const priority = filterPriority.value;
    const category = filterCategory.value;
    const date = filterDate.value;

    const filteredTasks = tasks.filter(task => {
        return (!priority || task.priority === priority) &&
               (!category || task.category === category) &&
               (!date || task.date === date);
    });

    renderTasks(orderTasks(filteredTasks));
}

// Function to render tasks
function renderTasks(filteredTasks = tasks) {
    taskList.innerHTML = ''; // Clear existing tasks

    filteredTasks.forEach(task => {
        const status = getStatus(task);
        const li = document.createElement('li');
        li.className = `task ${task.priority.toLowerCase()}`; // Apply priority class

        li.innerHTML = `
            <input type="checkbox" ${task.done ? 'checked' : ''} data-id="${task._id}" class="toggle-task-done">
            <span class="task-text ${task.done ? 'done' : ''}">${task.task}</span>
            <span class="priority">(${task.priority})</span>
            <span class="date">${task.date}</span>
            <span class="category">${task.category}</span>
            <span class="status">${status}</span>
            <button class="edit-task" data-id="${task._id}">Edit</button>
            <button class="delete-task" data-id="${task._id}">Delete</button>
        `;

        taskList.appendChild(li);
    });
}

// Add task
taskForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    const taskInput = document.getElementById('taskInput').value;
    const priority = document.getElementById('priority').value;
    const date = document.getElementById('scheduleDate').value;
    const category = document.getElementById('category').value;

    try {
        const response = await fetch('http://localhost:5000/api/usertasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ task: taskInput, priority, date, category })
        });
        if (!response.ok) throw new Error('Failed to add task');
        const newTask = await response.json();
        fetchTasks();
    } catch (error) {
        console.error('Error adding task:', error);
    }
});

// Edit task
taskList.addEventListener('click', async function (event) {
    if (event.target.classList.contains('edit-task')) {
        const id = event.target.getAttribute('data-id');
        const task = tasks.find(task => task._id === id);
        if (!task) {
            console.error(`Task with ID ${id} not found`);
            return;
        }

        const newTask = prompt('Edit Task:', task.task);
        const newPriority = prompt('Edit Priority (low, medium, high):', task.priority);
        const newDate = prompt('Edit Date (YYYY-MM-DD):', task.date);
        const newCategory = prompt('Edit Category (work, personal, academic, fitness, art):', task.category);

        if (newTask !== null && newPriority !== null && newDate !== null && newCategory !== null) {
            try {
                const response = await fetch(`http://localhost:5000/api/usertasks/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        task: newTask.trim(),
                        priority: newPriority.trim(),
                        date: newDate.trim(),
                        category: newCategory.trim(),
                        done: task.done,
                        dateAdded: task.dateAdded,
                        dateCompleted: task.dateCompleted
                    })
                });
                if (!response.ok) throw new Error('Failed to update task');
                fetchTasks();
            } catch (error) {
                console.error('Error updating task:', error);
            }
        }
    }
});

// Delete task
taskList.addEventListener('click', async function (event) {
    if (event.target.classList.contains('delete-task')) {
        const id = event.target.getAttribute('data-id');
        if (confirm(`Are you sure you want to delete this task?`)) {
            try {
                await fetch(`http://localhost:5000/api/usertasks/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                fetchTasks();
            } catch (error) {
                console.error('Error deleting task:', error);
            }
        }
    }
});

// Toggle task done state
taskList.addEventListener('change', async function (event) {
    if (event.target.classList.contains('toggle-task-done')) {
        const id = event.target.getAttribute('data-id');
        const task = tasks.find(task => task._id === id);
        const updatedTask = { ...task, done: !task.done, dateCompleted: task.done ? null : new Date().toISOString().split('T')[0] };

        try {
            const response = await fetch(`http://localhost:5000/api/usertasks/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedTask)
            });
            if (!response.ok) throw new Error('Failed to update task');
            fetchTasks();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    }
});

// Event listeners for filters and ordering
filterPriority.addEventListener('change', filterTasks);
filterCategory.addEventListener('change', filterTasks);
filterDate.addEventListener('input', filterTasks);
orderTasksSelect.addEventListener('change', () => renderTasks(orderTasks(tasks)));

// Logout
logoutButton.addEventListener('click', function () {
    localStorage.removeItem('token');
    localStorage.removeItem('UsernameTemp');
    window.location.href = 'connect.html';
});

// Initial fetching and rendering of tasks
fetchUser();
fetchTasks();
