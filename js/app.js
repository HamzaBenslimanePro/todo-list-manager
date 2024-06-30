// Get tasks from localStorage or initialize an empty array
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const prioritySelect = document.getElementById('priority'); // Add priority select element
const taskList = document.getElementById('tasks');

// Function to render tasks
function renderTasks() {
    // Clear existing tasks
    taskList.innerHTML = '';

    // Render each task
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${task.task} <span class="priority">${task.priority}</span>
            <button onclick="editTask(${index})">Edit</button>
            <button onclick="deleteTask(${index})">Delete</button>
        `;
        taskList.appendChild(li);
    });

    // Save tasks to localStorage
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to add a new task
function addTask(task, priority) {
    tasks.push({ task: task, priority: priority }); // Store task with priority
    renderTasks();
    taskInput.value = ''; // Clear input after adding task
}

// Function to edit a task
function editTask(index) {
    const newTask = prompt('Edit Task:', tasks[index].task);
    if (newTask !== null) {
        tasks[index].task = newTask.trim();
        renderTasks();
    }
}

// Function to delete a task
function deleteTask(index) {
    if (confirm(`Are you sure you want to delete "${tasks[index].task}"?`)) {
        tasks.splice(index, 1);
        renderTasks();
    }
}

// Event listener for form submission
taskForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const task = taskInput.value.trim();
    const priority = prioritySelect.value; // Get selected priority
    if (task !== '') {
        addTask(task, priority);
    }
});

// Initial rendering of tasks
renderTasks();
