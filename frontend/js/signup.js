// Select the signup form
const signupForm = document.getElementById('adminSignupForm');

// Function to validate email format
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Function to display error messages
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
signupForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // Get input values
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');

    let valid = true;

    // Validate name
    if (name.value.trim() === '') {
        showError(name, 'Full name is required.');
        valid = false;
    } else {
        clearError(name);
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
    } else if (password.value.length < 8) {
        showError(password, 'Password must be at least 8 characters.');
        valid = false;
    } else {
        clearError(password);
    }

    // Validate confirm password
    if (confirmPassword.value.trim() === '') {
        showError(confirmPassword, 'Please confirm your password.');
        valid = false;
    } else if (confirmPassword.value !== password.value) {
        showError(confirmPassword, 'Passwords do not match.');
        valid = false;
    } else {
        clearError(confirmPassword);
    }

    // If all validations pass
    if (valid) {
        alert('Form submitted successfully!');
        
    }
});
