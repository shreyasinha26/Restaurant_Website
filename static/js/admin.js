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

function clearError(input) {
    let errorElem = input.nextElementSibling;
    if (errorElem && errorElem.classList.contains('error-msg')) {
        errorElem.textContent = '';
    }
    input.style.borderColor = '#ddd';
}

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
    const token = localStorage.getItem('admin_token');

    if (token && window.location.pathname === '/app/login') {
        fetch('/app/api/check-auth', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(r => r.json())
        .then(data => {
            if (data.authenticated) {
                window.location.href = '/app/admin-dashboard';
            } else {
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_email');
            }
        })
        .catch(() => {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_email');
        });
    }
}

function clearAutoFill() {
    const emailField = document.getElementById('email');
    const passwordField = document.getElementById('password');

    emailField.value = '';
    passwordField.value = '';

    emailField.setAttribute('autocomplete', 'off');
    passwordField.setAttribute('autocomplete', 'new-password');

    emailField.focus();
}

// Form submit
loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email');
    const password = document.getElementById('password');
    let valid = true;

    if (email.value.trim() === '') {
        showError(email, 'Email is required.');
        valid = false;
    } else if (!isValidEmail(email.value.trim())) {
        showError(email, 'Please enter a valid email.');
        valid = false;
    } else {
        clearError(email);
    }

    if (password.value.trim() === '') {
        showError(password, 'Password is required.');
        valid = false;
    } else {
        clearError(password);
    }

    if (valid) {
        showLoading(true);

        try {
            const response = await fetch('/app/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    email: email.value.trim(),
                    password: password.value.trim()
                })
            });

            const data = await response.json();
            showLoading(false);

            if (data.success) {
                if (data.token) {
                    localStorage.setItem('admin_token', data.token);
                    localStorage.setItem('admin_email', data.admin.email);
                    localStorage.setItem('admin_name', data.admin.full_name);
                }
                window.location.href = '/app/admin-dashboard';
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

window.addEventListener('DOMContentLoaded', function() {
    checkExistingLogin();
    clearAutoFill();
});
