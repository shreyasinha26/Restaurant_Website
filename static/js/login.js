// Select the login form
const loginForm = document.getElementById('loginForm');

// Function to validate email format
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Function to show error messages
function showError(input, message) {
    let errorElem = input.nextElementSibling;
    if (!errorElem || !errorElem.classList.contains('error-msg')) {
        errorElem = document.createElement('div');
        errorElem.className = 'error-msg';
        errorElem.style.color = '#ff4d4d';
        errorElem.style.fontSize = '0.8rem';
        errorElem.style.marginTop = '5px';
        input.parentNode.appendChild(errorElem);
    }
    errorElem.textContent = message;
    input.style.borderColor = '#ff4d4d';
}

// Function to clear error messages
function clearError(input) {
    let errorElem = input.nextElementSibling;
    if (errorElem && errorElem.classList.contains('error-msg')) {
        errorElem.textContent = '';
    }
    input.style.borderColor = '#ddd';
}

// Function to show loading state
function setLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.textContent = 'Logging in...';
        button.style.opacity = '0.7';
    } else {
        button.disabled = false;
        button.textContent = 'Login';
        button.style.opacity = '1';
    }
}

// Function to show success/error messages
function showMessage(message, isError = false) {
    // Remove existing message
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message ${isError ? 'error' : 'success'}`;
    messageDiv.textContent = message;
    messageDiv.style.padding = '10px';
    messageDiv.style.borderRadius = '8px';
    messageDiv.style.marginBottom = '15px';
    messageDiv.style.textAlign = 'center';
    messageDiv.style.fontWeight = '600';
    messageDiv.style.backgroundColor = isError ? '#ffebee' : '#e8f5e8';
    messageDiv.style.color = isError ? '#c62828' : '#2e7d32';
    messageDiv.style.border = isError ? '1px solid #ffcdd2' : '1px solid #c8e6c9';

    loginForm.insertBefore(messageDiv, loginForm.firstChild);
}

// Form submit event
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const loginButton = this.querySelector('button[type="submit"]');
    let valid = true;

    // Validate email
    if (email.value.trim() === '') {
        showError(email, 'Email is required.');
        valid = false;
    } else if (!isValidEmail(email.value.trim())) {
        showError(email, 'Please enter a valid email.');
        valid = false;
    } else {
        clearError(email);
    }

    // Validate password
    if (password.value.trim() === '') {
        showError(password, 'Password is required.');
        valid = false;
    } else {
        clearError(password);
    }

    // If validation passes, make API call
    if (valid) {
        setLoading(loginButton, true);
        
        try {
            const loginData = {
                email: email.value.trim(),
                password: password.value
            };

            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important for cookies
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (response.ok) {
                // Store token and user data in localStorage
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                showMessage('Login successful! Redirecting...', false);
                
                // Redirect to dashboard after 1 second
                setTimeout(() => {
                    window.location.href = '/customer_dashboard';
                }, 1000);
                
            } else {
                showMessage(data.error || 'Login failed!', true);
            }
        } catch (error) {
            console.error('Login error:', error);
            showMessage('An error occurred during login. Please try again.', true);
        } finally {
            setLoading(loginButton, false);
        }
    }
});

// Real-time validation
document.getElementById('email').addEventListener('input', function() {
    if (this.value.trim() !== '' && !isValidEmail(this.value.trim())) {
        showError(this, 'Please enter a valid email.');
    } else {
        clearError(this);
    }
});

document.getElementById('password').addEventListener('input', function() {
    if (this.value.trim() === '') {
        showError(this, 'Password is required.');
    } else {
        clearError(this);
    }
});

// Check if user is already logged in (optional)
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
});


// In login.js - Update the checkAuthStatus function
async function checkAuthStatus() {
    try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            return; // No token, stay on login page
        }

        // Verify token with server
        const response = await fetch('/api/current-user', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        
        if (response.ok) {
            // User is already logged in, redirect to dashboard
            console.log("User already logged in, redirecting to dashboard");
            window.location.href = '/customer_dashboard';
        } else {
            // Token is invalid, clear it
            console.log("Invalid token, clearing storage");
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            // Stay on login page
        }
    } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid token
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
    }
}