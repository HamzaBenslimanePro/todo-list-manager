document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
    const taskModal = document.getElementById('taskModal');
    const taskForm = document.getElementById('taskForm');
    const closeBtn = document.querySelector('.close');

    // Retrieve tasks from localStorage
    const savedTasks = JSON.parse(localStorage.getItem('tasksCalendar')) || [];

    // Initialize FullCalendar
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        editable: true,
        selectable: true,
        dateClick: function(info) {
            taskModal.style.display = 'block';
            document.getElementById('taskDate').value = info.dateStr;
        },
        events: savedTasks, // Load saved tasks
        eventDidMount: function(info) {
            $(info.el).tooltip({
                title: `<strong>Task:</strong> ${info.event.title}<br>
                        <strong>Description:</strong> ${info.event.extendedProps.description}<br>
                        <strong>Date:</strong> ${info.event.start.toLocaleDateString()}<br>
                        ${info.event.allDay ? '' : `<strong>Time:</strong> ${info.event.start.toLocaleTimeString()}<br>`}
                        <strong>Priority:</strong> ${info.event.extendedProps.priority}<br>
                        <strong>Category:</strong> ${info.event.extendedProps.category}`,
                html: true,
                placement: 'top',
                trigger: 'hover',
                container: 'body'
            });
        },
        eventContent: function(arg) {
            let title = document.createElement('div');
            title.innerHTML = arg.event.title;

            let arrayOfDomNodes = [ title ];

            return { domNodes: arrayOfDomNodes };
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
        const date = document.getElementById('taskDate').value;
        const time = document.getElementById('taskTime').value;
        const category = document.getElementById('taskCategory').value;
        const description = document.getElementById('taskDescription').value;
        const priority = document.getElementById('taskPriority').value;

        const taskEvent = {
            title: `${title} (${priority})`,
            start: time ? `${date}T${time}` : date,
            allDay: !time,
            backgroundColor: getPriorityColor(priority),
            borderColor: getPriorityColor(priority),
            extendedProps: {
                description,
                priority,
                category
            }
        };

        // Add task to calendar
        calendar.addEvent(taskEvent);

        // Save task to localStorage
        savedTasks.push(taskEvent);
        localStorage.setItem('tasksCalendar', JSON.stringify(savedTasks));

        // Close modal and reset form
        taskModal.style.display = 'none';
        taskForm.reset();
    });

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
});
