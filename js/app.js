// Get tasks from localStorage or initialize an empty array
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Element references
const taskForm = document.getElementById('taskFormElement');
const taskInput = document.getElementById('taskInput');
const prioritySelect = document.getElementById('priority');
const scheduleDateInput = document.getElementById('scheduleDate');
const categorySelect = document.getElementById('category');
const taskList = document.getElementById('tasks');

// Filter elements
const filterPriority = document.getElementById('filterPriority');
const filterCategory = document.getElementById('filterCategory');
const filterDate = document.getElementById('filterDate');
const orderTasksSelect = document.getElementById('orderTasks');

// Function to render tasks
function renderTasks(filteredTasks = tasks) {
    // Clear existing tasks
    taskList.innerHTML = '';

    // Render each task
    filteredTasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = `task ${task.priority.toLowerCase()}`; // Apply priority class

        li.innerHTML = `
            <input type="checkbox" ${task.done ? 'checked' : ''} onchange="toggleTaskDone(${index})">
            <span class="task-text ${task.done ? 'done' : ''}">${task.task}</span>
            <span class="priority">(${task.priority})</span>
            <span class="date">${task.date}</span>
            <span class="category">${task.category}</span>
            <span class="status">${getStatus(task)}</span>
            <button onclick="editTask(${index})">Edit</button>
            <button onclick="deleteTask(${index})">Delete</button>
        `;

        taskList.appendChild(li);
    });

    // Save tasks to localStorage
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Function to get status of task
function getStatus(task) {
    const currentDate = new Date().toISOString().split('T')[0];
    
    if (!task.done && task.date > currentDate) {
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

// Function to add a new task
function addTask(task, priority, date, category) {
    tasks.push({ 
        task, 
        priority, 
        date, 
        category, 
        done: false,
        dateAdded: new Date().toISOString().split('T')[0], // Add current date as dateAdded
        dateCompleted: null // Initialize dateCompleted as null
    });
    renderTasks(orderTasks(tasks));

    taskInput.value = '';
    scheduleDateInput.value = '';
    categorySelect.value = '';

    const lastTask = taskList.lastElementChild;
    if (lastTask) {
        lastTask.scrollIntoView({ behavior: 'smooth' });
    }
}

// Function to edit a task
function editTask(index) {
    const task = tasks[index];
    const newTask = prompt('Edit Task:', task.task);
    const newPriority = prompt('Edit Priority (low, medium, high):', task.priority);
    const newDate = prompt('Edit Date (YYYY-MM-DD):', task.date);
    const newCategory = prompt('Edit Category (work, personal, academic, fitness, art):', task.category);

    if (newTask !== null && newPriority !== null && newDate !== null && newCategory !== null) {
        tasks[index] = {
            ...tasks[index],
            task: newTask.trim(),
            priority: newPriority.trim(),
            date: newDate.trim(),
            category: newCategory.trim(),
        };
        renderTasks(orderTasks(tasks));
    }
}

// Function to delete a task
function deleteTask(index) {
    if (confirm(`Are you sure you want to delete "${tasks[index].task}"?`)) {
        tasks.splice(index, 1);
        renderTasks(orderTasks(tasks));
    }
}

// Function to toggle task done state
function toggleTaskDone(index) {
    tasks[index].done = !tasks[index].done;
    tasks[index].dateCompleted = tasks[index].done ? new Date().toISOString().split('T')[0] : null; // Set dateCompleted when task is done
    renderTasks(orderTasks(tasks));
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

// Event listener for form submission
taskForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const task = taskInput.value.trim();
    const priority = prioritySelect.value;
    const date = scheduleDateInput.value;
    const category = categorySelect.value;

    if (task !== '') {
        addTask(task, priority, date, category);
    }
});

// Event listeners for filters and ordering
filterPriority.addEventListener('change', filterTasks);
filterCategory.addEventListener('change', filterTasks);
filterDate.addEventListener('input', filterTasks);
orderTasksSelect.addEventListener('change', () => renderTasks(orderTasks(tasks)));

// Initial rendering of tasks
renderTasks(orderTasks(tasks));
