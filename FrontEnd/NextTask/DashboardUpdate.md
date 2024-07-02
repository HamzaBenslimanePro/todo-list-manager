To integrate the functionality of displaying the user's to-do list on the dashboard page (`dashboard.html`), you'll need to adjust both your frontend (`dashboard.js`) and backend (API endpoints for fetching user-specific tasks). Here’s how you can proceed:

### Backend Adjustments

1. **Define API Endpoint**: Create an API endpoint in your backend (`/api/todos`) that retrieves tasks specific to the logged-in user.

   Example in `routes/todoRoutes.js`:
   ```javascript
   const express = require('express');
   const router = express.Router();
   const auth = require('../middleware/auth');
   const Todo = require('../models/Todo');

   // GET user's todos
   router.get('/todos', auth, async (req, res) => {
       try {
           const todos = await Todo.find({ user: req.user.id });
           res.json(todos);
       } catch (err) {
           console.error(err);
           res.status(500).send('Server Error');
       }
   });

   module.exports = router;
   ```

   Ensure you have the appropriate middleware (`auth`) to verify the JWT and populate `req.user` with the user's details.

2. **Todo Model**: Ensure your `Todo` model (`models/Todo.js`) includes a `user` field to associate tasks with users:
   ```javascript
   const mongoose = require('mongoose');

   const todoSchema = new mongoose.Schema({
       user: {
           type: mongoose.Schema.Types.ObjectId,
           ref: 'User',
           required: true
       },
       title: {
           type: String,
           required: true
       },
       completed: {
           type: Boolean,
           default: false
       },
       // Add other fields as needed
   });

   module.exports = mongoose.model('Todo', todoSchema);
   ```

### Frontend Adjustments

3. **Dashboard.js**: Update `dashboard.js` to fetch and display the user's to-do list items.

   ```javascript
   document.addEventListener('DOMContentLoaded', function () {
       const user = JSON.parse(localStorage.getItem('user'));
       const token = localStorage.getItem('token');

       // Display user's name in the navigation bar
       const userGreeting = document.getElementById('userGreeting');
       if (userGreeting && user) {
           userGreeting.textContent = `Hello, ${user.name}`;
       }

       // Logout functionality
       const logoutButton = document.getElementById('logoutButton');
       if (logoutButton) {
           logoutButton.addEventListener('click', function () {
               localStorage.removeItem('token');
               localStorage.removeItem('user');
               window.location.href = 'index.html';
           });
       }

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
   ```

### Dashboard.html

4. **Dashboard UI**: Ensure your `dashboard.html` is correctly set up to display the user's name and to-do list.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Dashboard</title>
    <link rel="stylesheet" href="css/dashboard-styles.css">
    <script defer src="js/dashboard.js"></script>
</head>
<body>
    <header>
        <nav>
            <ul>
                <li><a href="index.html">Home</a></li>
                <li><span id="userGreeting"></span></li>
                <li><a href="#" id="logoutButton">Logout</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <h1>Welcome to your Dashboard</h1>
        <div id="todoApp">
            <!-- To-Do List Application UI will be populated by JavaScript -->
        </div>
    </main>
</body>
</html>
```

### Summary

- **Backend**: Create API endpoints (`/api/todos`) to fetch user-specific tasks.
- **Frontend**: Update `dashboard.js` to fetch and display tasks after the user logs in.
- **Dashboard.html**: Ensure the HTML structure is set up to display user greetings and the to-do list.

Make sure your backend is correctly handling authentication, and the `Todo` model associates tasks with the correct user. With these adjustments, your dashboard will display the user's tasks upon successful login. Adjustments might be needed based on your specific application structure and requirements.