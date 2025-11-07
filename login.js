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

// Form submit event
loginForm.addEventListener('submit', function(e) {
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
        alert('Login successful!');
        
    }
});
