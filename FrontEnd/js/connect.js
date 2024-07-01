// frontend/js/connect.js

document.addEventListener('DOMContentLoaded', function () {
    // Log In Form Submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();
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
                    localStorage.setItem('user', JSON.stringify(data.user));
                    // Redirect to the custom index page
                    window.location.href = 'dashboard.html';
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
        signupForm.addEventListener('submit', async function (event) {
            event.preventDefault();
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            //const name = document.getElementById('signupName').value;

            try {
                const response = await fetch('http://localhost:5000/api/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password, name }),
                });
                const data = await response.json();

                if (response.ok) {
                    console.log('Signed up successfully:', data);
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    // Redirect to the custom index page
                    window.location.href = 'dashboard.html';
                } else {
                    console.error('Signup failed:', data);
                }
            } catch (error) {
                console.error('Error signing up:', error);
            }
        });
    }
});
