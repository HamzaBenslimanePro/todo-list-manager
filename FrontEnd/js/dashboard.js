// frontend/js/dashboard.js

document.addEventListener('DOMContentLoaded', function () {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (user) {
        displayUserGreeting(user);
    } else {
        window.location.href = 'index.html'; // Redirect to login if no user data
    }

    setupLogoutButton();
    fetchAndDisplayTodos(token);
    setupTaskForm();

    function displayUserGreeting(user) {
        const userGreeting = document.getElementById('userGreeting');
        if (userGreeting) {
            userGreeting.textContent = `Hello, ${user.name}`;
        }
    }

    function setupLogoutButton() {
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', function () {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = 'index.html';
            });
        }
    }

    async function fetchAndDisplayTodos(token) {
        try {
            const response = await fetch('http://localhost:5000/api/tasks', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const todos = await response.json();
            displayTodos(todos);
        } catch (error) {
            console.error('Error fetching todos:', error);
            displayError('Failed to load to-do items.');
        }
    }

    function displayTodos(todos) {
        const todoApp = document.getElementById('todoApp');
        if (todoApp) {
            todoApp.innerHTML = ''; // Clear previous content
            todos.forEach(todo => {
                const todoItem = document.createElement('div');
                todoItem.classList.add('todo-item');
                todoItem.textContent = todo.title;
                if (todo.completed) {
                    todoItem.classList.add('completed');
                }

                // Add delete button for each task
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', () => deleteTask(todo._id));
                todoItem.appendChild(deleteButton);

                todoApp.appendChild(todoItem);
            });
        }
    }

    function displayError(message) {
        const todoApp = document.getElementById('todoApp');
        if (todoApp) {
            todoApp.innerHTML = `<p class="error-message">${message}</p>`;
        }
    }

    function setupTaskForm() {
        const taskForm = document.getElementById('taskForm');
        if (taskForm) {
            taskForm.addEventListener('submit', async function (event) {
                event.preventDefault();
                const taskTitle = document.getElementById('taskTitle').value;
                if (taskTitle) {
                    await createTask(taskTitle);
                }
            });
        }
    }

    async function createTask(title) {
        try {
            const response = await fetch('http://localhost:5000/api/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const newTask = await response.json();
            displayTodos([newTask, ...document.getElementById('todoApp').childNodes]);
        } catch (error) {
            console.error('Error creating task:', error);
        }
    }

    async function deleteTask(id) {
        try {
            const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            fetchAndDisplayTodos(token); // Refresh the list
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    }
});
