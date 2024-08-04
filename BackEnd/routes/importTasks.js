const express = require('express');
const multer = require('multer');
const fs = require('fs');
const readline = require('readline');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/import-tasks', upload.single('taskFile'), async (req, res) => {
    try {
        const filePath = req.file.path;
        const tasks = [];

        const fileStream = fs.createReadStream(filePath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let task = {};
        for await (const line of rl) {
            if (line.trim() === '') {
                if (Object.keys(task).length > 0) {
                    tasks.push(formatTask(task));
                    task = {};
                }
            } else {
                const [key, value] = line.split(': ');
                task[key.toLowerCase().replace(' ', '_')] = value;
            }
        }

        if (Object.keys(task).length > 0) {
            tasks.push(formatTask(task));
        }

        fs.unlinkSync(filePath); // Delete the file after reading

        res.json({ tasks });
    } catch (err) {
        console.error('Error processing file:', err);
        res.status(500).json({ msg: 'Server error' });
    }
});

function formatTask(task) {
    return {
        id: String(Date.now() + Math.random()),
        title: `${task.title} (${task.priority})`,
        start: `${task.start_date}T${task.task_time}`,
        end: task.end_date ? `${task.end_date}T${task.task_time}` : null,
        allDay: !task.task_time,
        backgroundColor: getPriorityColor(task.priority),
        borderColor: getPriorityColor(task.priority),
        extendedProps: {
            description: task.description,
            priority: task.priority,
            category: task.category
        }
    };
}

function getPriorityColor(priority) {
    switch (priority.toLowerCase()) {
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

module.exports = router;
