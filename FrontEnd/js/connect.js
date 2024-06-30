// JavaScript for connect.html form handling

// Log In Form Submission
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Example: Replace with actual authentication logic
    console.log(`Login Form Submitted with Email: ${email} and Password: ${password}`);
    // Add logic to authenticate user
});

// Sign Up Form Submission
const signupForm = document.getElementById('signupForm');

signupForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const signupEmail = document.getElementById('signupEmail').value;
    const signupPassword = document.getElementById('signupPassword').value;

    // Example: Replace with actual sign up logic
    console.log(`Sign Up Form Submitted with Email: ${signupEmail} and Password: ${signupPassword}`);
    // Add logic to create new user account
});
