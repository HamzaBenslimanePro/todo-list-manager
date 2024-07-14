// Get tasks from localStorage
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// Function to calculate task statistics
function calculateStatistics() {
    console.log("Calculating statistics...");

    let totalTasks = tasks.length;
    console.log(`Total tasks: ${totalTasks}`);

    let completedTasks = tasks.filter(task => {
        const status = getStatus(task);
        console.log(`Task: ${task.task}, Status: ${status}`);
        return status === 'Done';
    }).length;
    console.log(`Completed tasks: ${completedTasks}`);

    let highPriorityTasks = tasks.filter(task => task.priority === 'high').length;
    console.log(`High priority tasks: ${highPriorityTasks}`);

    let doneLateTasks = tasks.filter(task => {
        const status = getStatus(task);
        console.log(`Task: ${task.task}, Status: ${status}`);
        return status === 'Done Late';
    }).length;
    console.log(`Done late tasks: ${doneLateTasks}`);

    let inProcessTasks = tasks.filter(task => {
        const status = getStatus(task);
        console.log(`Task: ${task.task}, Status: ${status}`);
        return status === 'In Process';
    }).length;
    console.log(`In process tasks: ${inProcessTasks}`);

    let lateTasks = tasks.filter(task => {
        const status = getStatus(task);
        console.log(`Task: ${task.task}, Status: ${status}`);
        return status === 'Late';
    }).length;
    console.log(`Late tasks: ${lateTasks}`);

    return { totalTasks, completedTasks, highPriorityTasks, doneLateTasks, inProcessTasks, lateTasks };
}

// Function to get status of task
function getStatus(task) {
    const currentDate = new Date().toISOString().split('T')[0];
    console.log(`Checking status for task: ${task.task}, Done: ${task.done}, Date: ${task.date}, Current Date: ${currentDate}`);

    if (!task.done && task.date > currentDate) {
        console.log(`Task: ${task.task} is In Process`);
        return 'In Process';
    } else if (task.done && task.date >= currentDate) {
        console.log(`Task: ${task.task} is Done`);
        return 'Done';
    } else if (task.done && task.date < currentDate) {
        console.log(`Task: ${task.task} is Done Late`);
        return 'Done Late';
    } else if (!task.done && task.date < currentDate) {
        console.log(`Task: ${task.task} is Late`);
        return 'Late';
    }

    console.log(`Task: ${task.task} has no status`);
    return '';
}

// Function to render task statistics
function renderStatistics() {
    let stats = calculateStatistics();
    let statsDiv = document.getElementById('stats');
    statsDiv.innerHTML = `
        <h2>Stats:</h2>
        <p>Total tasks: ${stats.totalTasks}</p>
        <p>Completed tasks: ${stats.completedTasks}</p>
        <p>High priority tasks: ${stats.highPriorityTasks}</p>
        <p>Done Late tasks: ${stats.doneLateTasks}</p>
        <p>In Process tasks: ${stats.inProcessTasks}</p>
        <p>Late tasks: ${stats.lateTasks}</p>
    `;
}

// Function to render task status chart
function renderTaskStatusChart() {
    let stats = calculateStatistics();
    var ctx = document.getElementById("taskStatusChart").getContext('2d');

    new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Done', 'Done Late', 'In Process', 'Late'],
            datasets: [{
                data: [stats.completedTasks, stats.doneLateTasks, stats.inProcessTasks, stats.lateTasks],
                backgroundColor: ['#36a2eb', '#ff6384', '#ffcd56', '#cc65fe']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
        }
    });
}

// Function to render task frequency chart
function renderTaskFrequencyChart() {
    let datesAdded = {};
    let datesCompleted = {};

    tasks.forEach(task => {
        console.log(`Task: ${task.task}, Date Added: ${task.dateAdded}, Date Completed: ${task.dateCompleted}`);

        if (task.dateAdded && !isNaN(new Date(task.dateAdded))) {
            const addedDate = new Date(task.dateAdded).toISOString().split('T')[0];
            datesAdded[addedDate] = (datesAdded[addedDate] || 0) + 1;
        }

        if (task.done && task.dateCompleted && !isNaN(new Date(task.dateCompleted))) {
            const completedDate = new Date(task.dateCompleted).toISOString().split('T')[0];
            datesCompleted[completedDate] = (datesCompleted[completedDate] || 0) + 1;
        }
    });

    let dates = Array.from(new Set([...Object.keys(datesAdded), ...Object.keys(datesCompleted)])).sort();
    let addedCounts = dates.map(date => datesAdded[date] || 0);
    let completedCounts = dates.map(date => datesCompleted[date] || 0);

    console.log('Dates:', dates);
    console.log('Added Counts:', addedCounts);
    console.log('Completed Counts:', completedCounts);

    var ctx = document.getElementById("taskFrequencyChart").getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Tasks Added',
                data: addedCounts,
                borderColor: '#36a2eb',
                fill: false
            }, {
                label: 'Tasks Completed',
                data: completedCounts,
                borderColor: '#cc65fe',
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10
                }
            }
        }
    });
}

// Function to render success bar chart
function renderSuccessBarChart() {
    let stats = calculateStatistics();
    let successRate = (stats.completedTasks / stats.totalTasks) * 100;
    console.log(`Success Rate: ${successRate}%`);

    var ctx = document.getElementById("successBarChart").getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Success Rate'],
            datasets: [{
                label: 'Success Rate (%)',
                data: [successRate],
                backgroundColor: ['#36a2eb']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// Function to render the circular progress gauge for success rate
/*function renderSuccessGaugeChart(successRate) {
    var chart1 = JSC.chart( 
        'successGaugeChart', 
        JSC.merge(defaultOptions(), { 
          defaultPoint: { 
            marker: { 
              outline: { 
                width: 5, 
                color: 'currentColor'
              }, 
              rotate: 'auto', 
              type: 'triangle', 
              size: 30 
            } 
          }, 
          series: [{ points: [{ x: 0.45, y: 23 }] }] 
        }) 
      ); 
}*/

function filterTasksByDateRange(startDate, endDate) {
    return tasks.filter(task => {
        if (task.dateAdded) {
            const taskDate = new Date(task.dateAdded);
            return taskDate >= startDate && taskDate <= endDate;
        }
        // Adjust logic if you need to filter based on task completion date as well
        return false;
    });
}



document.addEventListener("DOMContentLoaded", function() {
    renderStatistics();
    renderTaskStatusChart();
    renderTaskFrequencyChart();
    renderSuccessBarChart();
    let stats = calculateStatistics();
    let successRate = (stats.completedTasks / stats.totalTasks) * 100;
});
