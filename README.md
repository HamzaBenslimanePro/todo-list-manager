# To-Do List Manager

## Introduction

The To-Do List Manager is a web application designed to streamline task management. Users can add, edit, delete, prioritize, schedule, categorize, and filter tasks to enhance productivity and organization. The app provides a user-friendly interface and ensures a seamless experience for managing daily tasks.

**Deployed Site**: [To-Do List Manager](https://yourdeployedproject.com)  
**Final Project Blog Article**: [Read the Blog Post](https://yourblogpost.com)  
**Author LinkedIn**: [Your LinkedIn Profile](https://www.linkedin.com/in/yourprofile)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/todo-list-manager.git
2. Navigate to the project directory:
   ```bash
   cd todo-list-manager
3. Install all dependencies:
   ```bash
   npm install
4. Start server:
   ```bash
   cd todo-list-manager
## Usage
1. Open your browser and navigate to http://localhost:5000 after starting npm.
2. Register or log in to your account or just use the demo.
3. Use the task management features to add, edit, delete, prioritize, schedule, categorize, and filter tasks.
4. Use the calender features (new).
## Contributing
Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch:
    ```bash
    git checkout -b feature/your-feature-name
3. Make your changes and commit them
   ```bash
    git commit -m "Add your feature"
4. push to branch
    ```bash
    git push origin feature/your-feature-name
5. Open a pull request.

## Related Projects

- [Todoist](https://todoist.com/)
- [Microsoft To Do](https://todo.microsoft.com/)
- [Google Keep](https://keep.google.com/)

## Licensing

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Project Details and Story

### Project Inspiration and Challenges

The inspiration for the To-Do List Manager came from my own struggles with managing multiple tasks and deadlines. During my university years, I often found myself juggling assignments, projects, and part-time work, leading me to explore various task management apps. I always felt they lacked certain features or had a steep learning curve, which inspired me to create a To-Do List Manager that is both feature-rich and user-friendly.

The most challenging part of this project was implementing real-time sorting and maintaining task references. Initially, sorting tasks dynamically without refreshing the page seemed straightforward, but ensuring that tasks' indexes remained consistent for editing and deleting was complex. I tackled this by modifying the `renderTasks` function to display tasks in the sorted order while keeping track of their original positions.

### Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript
  - I opted for these technologies to ensure a strong grasp of core web development concepts.
- **Backend**: Node.js, Express, MongoDB
  - Node.js and Express provided a lightweight server-side solution, while MongoDB allowed for scalable and efficient data storage.
- **Additional Tools**: LocalStorage for temporary data storage, Git for version control

### Features

1. **Task Management with Prioritization**: Add, edit, delete, and prioritize tasks.
2. **Task Scheduling**: Schedule tasks with specific dates.
3. **Categorization and Filtering**: Categorize tasks (e.g., sport, academic, art) and filter them for easy navigation.

### Technical Details

#### Real-Time Sorting Algorithm

The sorting algorithm sorts tasks based on priority levels dynamically. It involves:

1. Creating a function to sort the tasks array.
2. Modifying the `renderTasks` function to display sorted tasks.
3. Ensuring tasks' indexes remain consistent for editing and deleting.


### Future Enhancements
1. Mobile App Integration: Developing a mobile app to complement the web application.
2. Collaboration Features: Allowing multiple users to collaborate on tasks.
3. Advanced Analytics: Providing insights and analytics on task management and productivity.
## About Me
I am a passionate web developer dedicated to creating user-friendly and efficient web applications. The To-Do List Manager project is a testament to my commitment to continuous learning and improvement in software development.

- GitHub Repository: https://github.com/HamzaBenslimanePro/todo-list-manager
- Deployed Project: https://taskmasterone.000webhostapp.com/app.html
- Project Landing Page: https://taskmasterone.000webhostapp.com/
- LinkedIn Profile: https://www.linkedin.com/in/hamza-benslimane-949343304/

Thank you for taking the time to explore my project. I hope you find it useful and insightful!
