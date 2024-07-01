document.addEventListener('DOMContentLoaded', function () {
    // Display user's name in the navigation bar
    const user = JSON.parse(localStorage.getItem('user'));
    const userGreeting = document.getElementById('userGreeting');
    if (user) {
        userGreeting.textContent = `Hello, ${user.name}`;
    }

    // Logout functionality
    const logoutButton = document.getElementById('logoutButton');
    logoutButton.addEventListener('click', function () {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });

    const token = localStorage.getItem('token');

    // Fetch user's to-do list items
    async function fetchTodos() {
        try {
            const response = await fetch('http://localhost:5000/api/todos', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const todos = await response.json();
            // Display todos in the UI
            displayTodos(todos);
        } catch (error) {
            console.error('Error fetching todos:', error);
        }
    }

    // Function to display todos in the UI
    function displayTodos(todos) {
        const todoApp = document.getElementById('todoApp');
        todoApp.innerHTML = ''; // Clear previous content

        todos.forEach(todo => {
            const todoItem = document.createElement('div');
            todoItem.classList.add('todo-item');
            todoItem.textContent = todo.title;
            if (todo.completed) {
                todoItem.classList.add('completed');
            }
            todoApp.appendChild(todoItem);
        });
    }

    // Fetch and display todos on page load
    fetchTodos();
});
