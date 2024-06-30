// Get tasks from localStorage or initialize an empty array
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('tasks');

// Function to render tasks
function renderTasks() {
    // Clear existing tasks
    taskList.innerHTML = '';

    // Render each task
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${task}
            <button onclick="editTask(${index})">Edit</button>
            <button onclick="deleteTask(${index})">Delete</button>
        `;
        taskList.appendChild(li);
    });

    // Save tasks to localStorage
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to add a new task
function addTask(task) {
    tasks.push(task);
    renderTasks();
    taskInput.value = ''; // Clear input after adding task
}

// Function to edit a task
function editTask(index) {
    const newTask = prompt('Edit Task:', tasks[index]);
    if (newTask !== null) {
        tasks[index] = newTask.trim();
        renderTasks();
    }
}

// Function to delete a task
function deleteTask(index) {
    if (confirm(`Are you sure you want to delete "${tasks[index]}"?`)) {
        tasks.splice(index, 1);
        renderTasks();
    }
}

// Event listener for form submission
taskForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const task = taskInput.value.trim();
    if (task !== '') {
        addTask(task);
    }
});

// Initial rendering of tasks
renderTasks();
