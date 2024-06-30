document.getElementById('add-task').addEventListener('click', function() {
    const taskText = document.getElementById('new-task').value;
    if (taskText) {
        addTask(taskText);
        document.getElementById('new-task').value = '';
    }
});

function addTask(taskText) {
    const taskList = document.querySelector('#task-list ul');
    const newTask = document.createElement('li');
    newTask.textContent = taskText;
    taskList.appendChild(newTask);
    // Save the task to localStorage here if needed
}
