// ---------- SAFE LOGIN.JS ----------

// Try to get login form
const loginForm = document.getElementById('loginForm');

// Stop everything if form is not present (Prevents page breaking)
if (!loginForm) {
    console.warn("⚠ login.js loaded but no #loginForm found.");
}

// Function to validate email format
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Function to show error messages
function showError(input, message) {
    if (!input) return;

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
    if (!input) return;

    let errorElem = input.nextElementSibling;
    if (errorElem && errorElem.classList.contains('error-msg')) {
        errorElem.textContent = '';
    }
    input.style.borderColor = '#ddd';
}

// Clear all input fields
function clearInputFields() {
    const email = document.getElementById('email');
    const password = document.getElementById('password');

    if (email) {
        email.value = '';
        clearError(email);
    }
    if (password) {
        password.value = '';
        clearError(password);
    }
}

// Loading state
function setLoading(button, isLoading) {
    if (!button) return;

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

// Show success/error message
function showMessage(message, isError = false) {
    if (!loginForm) return;

    const existing = document.querySelector('.form-message');
    if (existing) existing.remove();

    const msg = document.createElement('div');
    msg.className = 'form-message';
    msg.textContent = message;

    msg.style.cssText = `
        padding: 10px;
        border-radius: 8px;
        margin-bottom: 15px;
        text-align: center;
        font-weight: 600;
        background-color: ${isError ? '#ffebee' : '#e8f5e8'};
        color: ${isError ? '#c62828' : '#2e7d32'};
        border: ${isError ? '1px solid #ffcdd2' : '1px solid #c8e6c9'};
    `;

    loginForm.insertBefore(msg, loginForm.firstChild);
}

// -----------------------------
// SUBMIT HANDLER (SAFE)
// -----------------------------
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const email = document.getElementById('email');
        const password = document.getElementById('password');
        const loginButton = this.querySelector('button[type="submit"]');

        let valid = true;

        if (!email || !password) {
            console.warn("⚠ Missing email or password fields.");
            return;
        }

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

        // Make API call
        if (valid) {
            setLoading(loginButton, true);

            try {
                const response = await fetch('/app/api/customer/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        email: email.value.trim(),
                        password: password.value.trim()
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    localStorage.setItem('auth_token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));

                    showMessage('Login successful! Redirecting...', false);

                    setTimeout(() => {
                        // FIX: Correct server path
                        window.location.href = '/app/customer_dashboard';
                    }, 1000);
                } else {
                    showMessage(data.error || 'Login failed!', true);
                    clearInputFields();
                }
            } catch (err) {
                console.error('Login error:', err);
                showMessage('Server error. Please try again.', true);
                clearInputFields();
            } finally {
                setLoading(loginButton, false);
            }
        }
    });
}

// -----------------------------
// REAL-TIME VALIDATION (SAFE)
// -----------------------------
const emailField = document.getElementById('email');
if (emailField) {
    emailField.addEventListener('input', function() {
        if (this.value.trim() !== '' && !isValidEmail(this.value.trim())) {
            showError(this, 'Please enter a valid email.');
        } else {
            clearError(this);
        }
    });
}

const passwordField = document.getElementById('password');
if (passwordField) {
    passwordField.addEventListener('input', function() {
        if (this.value.trim() === '') {
            showError(this, 'Password is required.');
        } else {
            clearError(this);
        }
    });
}

// -----------------------------
// CHECK LOGIN STATUS
// -----------------------------
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
});

async function checkAuthStatus() {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    try {
        const response = await fetch('/app/api/current-user', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` },
            credentials: 'include'
        });

        if (response.ok) {
            
            window.location.href = '/app/customer_dashboard';
        } else {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
        }
    } catch (err) {
        console.error('Auth check failed:', err);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
    }
}


