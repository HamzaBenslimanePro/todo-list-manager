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