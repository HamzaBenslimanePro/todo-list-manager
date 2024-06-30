// index.js
const signInModal = document.getElementById('signInModal');
const signInForm = document.getElementById('signInForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

// Function to open the sign-in modal
function openSignInModal() {
    signInModal.style.display = 'block';
}

// Function to close the sign-in modal
function closeSignInModal() {
    signInModal.style.display = 'none';
}

// Function to handle form submission
signInForm.addEventListener('submit', function(event) {
    event.preventDefault();

    // Basic validation (you can extend this with more robust validation)
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (username === '' || password === '') {
        alert('Please enter both username and password.');
        return;
    }

    // Simulate sign-in (replace with actual authentication logic)
    // For demo purposes, just show an alert
    alert(`Signing in with username: ${username}`);

    // Close the modal after sign-in
    closeSignInModal();

    // Redirect to the To-Do List app page (replace with actual redirect logic)
    window.location.href = 'app.html';
});

// Close the modal if the user clicks outside of it
window.addEventListener('click', function(event) {
    if (event.target === signInModal) {
        closeSignInModal();
    }
});
