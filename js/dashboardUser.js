//js/dashboardUser.js

document.addEventListener('DOMContentLoaded', function () {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'redirect.html';
        return;
    }

    const usernameHeader = document.getElementById('username');
    const logoutButton = document.getElementById('logoutButton');
    const taskForm = document.getElementById('taskFormElement');
    const taskList = document.getElementById('tasks');

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
            
        } catch (error) {
            console.error('Error fetching user:', error);
            //localStorage.removeItem('token');
            window.location.href = '#';
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
            const tasks = await response.json();
            if (!Array.isArray(tasks)) throw new Error('Tasks is not an array');
            renderTasks(tasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }

    // Render tasks on the page
    function renderTasks(tasks) {
        taskList.innerHTML = ''; // Clear existing tasks
        tasks.forEach(task => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${task.task}</span>
                <span>${task.priority}</span>
                <span>${task.date}</span>
                <span>${task.category}</span>
                <button onclick="editTask('${task._id}')">Edit</button>
                <button onclick="deleteTask('${task._id}')">Delete</button>
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

    // Logout
    logoutButton.addEventListener('click', function () {
        localStorage.removeItem('token');
        window.location.href = 'connect.html';
    });

    fetchUser();
    fetchTasks();
});
