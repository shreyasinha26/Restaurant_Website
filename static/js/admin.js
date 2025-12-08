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
function showLoading(show) {
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    if (show) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Logging in...';
    } else {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Login';
    }
}

// Check if already logged in
function checkExistingLogin() {
    // Check localStorage for token
    const token = localStorage.getItem('admin_token');
    if (token && window.location.pathname === '/login') {
        // Validate token
        fetch('/api/check-auth', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.authenticated) {
                // Already logged in, redirect to dashboard
                window.location.href = '/admin-dashboard';
            } else {
                // Invalid token, clear localStorage
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_email');
            }
        })
        .catch(() => {
            // Clear localStorage on error
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_email');
        });
    }
}

// Clear any autofilled values
function clearAutoFill() {
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');
    
    // Clear values
    emailField.value = '';
    passwordField.value = '';
    
    // Set autocomplete attributes to prevent browser autofill
    emailField.setAttribute('autocomplete', 'off');
    passwordField.setAttribute('autocomplete', 'new-password');
    
    // Focus on email field for better UX
    emailField.focus();
}

// Form submit event
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email');
    const password = document.getElementById('password');
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

    // If validation passes
    if (valid) {
        showLoading(true);
        
        try {
            // Send login request to backend
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important for cookies
                body: JSON.stringify({
                    email: email.value.trim(),
                    password: password.value.trim()
                })
            });
            
            const data = await response.json();
            
            showLoading(false);
            
            if (data.success) {
                // Store token in localStorage for JavaScript use
                if (data.token) {
                    localStorage.setItem('admin_token', data.token);
                    localStorage.setItem('admin_email', data.admin.email);
                    localStorage.setItem('admin_name', data.admin.full_name);
                }
            
                
                // Redirect to admin dashboard
                window.location.href = data.redirect || '/admin-dashboard';
            } else {
                alert('Login failed: ' + (data.message || 'Invalid credentials'));
            }
            
        } catch (error) {
            showLoading(false);
            console.error('Login error:', error);
            alert('Login failed. Please check your connection and try again.');
        }
    }
});

// On page load
window.addEventListener('DOMContentLoaded', function() {
    // Check existing login
    checkExistingLogin();
    
    // Clear any auto-filled values
    clearAutoFill();
    
});
