// frontend/js/connect.js

document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded and parsed');
    // Log In Form Submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log('Login form found');
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            console.log('Login form submitted');
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://localhost:5000/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });
                const data = await response.json();

                if (response.ok) {
                    console.log('Logged in successfully:', data);
                    localStorage.setItem('token', data.token);
                    console.log(data.username);
                    localStorage.setItem('UsernameTemp', data.username);
                    // Redirect to dashboard or another page
                    window.location.href = 'dashboardUser.html'; // Adjust as necessary (u need to create a special app interface for a specific user)
                } else {
                    console.error('Login failed:', data);
                }
            } catch (error) {
                console.error('Error logging in:', error);
            }
        });
    }

    // Sign Up Form Submission
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        console.log('Signup form found');
        signupForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            console.log('Signup form submitted');
            const signupUsername = document.getElementById('signupUsername').value;
            const signupEmail = document.getElementById('signupEmail').value;
            const signupPassword = document.getElementById('signupPassword').value;

            try {
                const response = await fetch('http://localhost:5000/api/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username: signupUsername, email: signupEmail, password: signupPassword }),
                });
                const data = await response.json();

                if (response.ok) {
                    console.log('Signed up successfully:', data);
                    // Redirect to dashboard or another page
                    window.location.href = 'connect.html';
                } else {
                    console.error('Signup failed:', data);
                }
            } catch (error) {
                console.error('Error signing up:', error);
            }
        });
    }
});
