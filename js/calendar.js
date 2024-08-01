document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
    const taskModal = document.getElementById('taskModal');
    const taskForm = document.getElementById('taskForm');
    const closeBtn = document.querySelector('.close');
    const filterPriority = document.getElementById('filterPriority');
    const filterCategory = document.getElementById('filterCategory');

    let currentEventId = null;

    // Retrieve tasks from localStorage
    const savedTasks = JSON.parse(localStorage.getItem('tasksCalendar')) || [];

    // Initialize FullCalendar
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        editable: true,
        selectable: true,
        dateClick: function(info) {
            currentEventId = null;
            taskModal.style.display = 'block';
            document.getElementById('modalTitle').innerText = 'Add Task';
            document.getElementById('startDate').value = info.dateStr;
            document.getElementById('endDate').value = '';
            document.getElementById('taskTitle').value = '';
            document.getElementById('taskTime').value = '';
            document.getElementById('taskCategory').value = 'work';
            document.getElementById('taskDescription').value = '';
            document.getElementById('taskPriority').value = 'low';
        },
        events: savedTasks, // Load saved tasks
        eventClick: function(info) {
            currentEventId = info.event.id;
            taskModal.style.display = 'block';
            document.getElementById('modalTitle').innerText = 'Edit Task';
            document.getElementById('startDate').value = info.event.startStr.split('T')[0];
            document.getElementById('endDate').value = info.event.endStr ? info.event.endStr.split('T')[0] : '';
            document.getElementById('taskTitle').value = info.event.title.split(' (')[0];
            document.getElementById('taskTime').value = info.event.startStr.split('T')[1] ? info.event.startStr.split('T')[1] : '';
            document.getElementById('taskCategory').value = info.event.extendedProps.category;
            document.getElementById('taskDescription').value = info.event.extendedProps.description;
            document.getElementById('taskPriority').value = info.event.extendedProps.priority;
        },
        eventDidMount: function(info) {
            $(info.el).tooltip({
                title: `<strong>Task:</strong> ${info.event.title}<br>
                        <strong>Description:</strong> ${info.event.extendedProps.description}<br>
                        <strong>Start Date:</strong> ${info.event.start.toLocaleDateString()}<br>
                        ${info.event.allDay ? '' : `<strong>Time:</strong> ${info.event.start.toLocaleTimeString()}<br>`}
                        ${info.event.end ? `<strong>End Date:</strong> ${info.event.end.toLocaleDateString()}<br>` : ''}
                        <strong>Priority:</strong> ${info.event.extendedProps.priority}<br>
                        <strong>Category:</strong> ${info.event.extendedProps.category}`,
                html: true,
                placement: 'top',
                trigger: 'hover',
                container: 'body'
            });
        }
    });

    calendar.render();

    // Close modal when clicking on the 'x' button
    closeBtn.onclick = function () {
        taskModal.style.display = 'none';
    }

    // Close modal when clicking outside of the modal
    window.onclick = function (event) {
        if (event.target == taskModal) {
            taskModal.style.display = 'none';
        }
    }

    // Handle task form submission
    taskForm.addEventListener('submit', function (event) {
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

        if (currentEventId) {
            // Update existing event
            const existingEvent = calendar.getEventById(currentEventId);
            existingEvent.remove();
            const index = savedTasks.findIndex(task => task.id === currentEventId);
            savedTasks.splice(index, 1, taskEvent);
        } else {
            // Add new event
            savedTasks.push(taskEvent);
        }

        // Add/Update task to calendar
        calendar.addEvent(taskEvent);

        // Save task to localStorage
        localStorage.setItem('tasksCalendar', JSON.stringify(savedTasks));

        // Close modal and reset form
        taskModal.style.display = 'none';
        taskForm.reset();
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

    // Handle filtering
    filterPriority.addEventListener('change', function () {
        filterEvents();
    });

    filterCategory.addEventListener('change', function () {
        filterEvents();
    });

    function filterEvents() {
        const priority = filterPriority.value;
        const category = filterCategory.value;

        const filteredTasks = savedTasks.filter(task => {
            return (!priority || task.extendedProps.priority === priority) &&
                   (!category || task.extendedProps.category === category);
        });

        calendar.removeAllEvents();
        calendar.addEventSource(filteredTasks);
    }
});
