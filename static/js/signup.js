// Select the signup form - Updated ID to match your HTML
const signupForm = document.getElementById('customerSignupForm');

// Function to validate email format
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Function to validate phone number
function isValidPhone(phone) {
    const re = /^[0-9]{10}$/;
    return re.test(phone);
}

// Function to display error messages
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
        button.textContent = 'Creating Account...';
        button.style.opacity = '0.7';
    } else {
        button.disabled = false;
        button.textContent = 'Create Account';
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

    signupForm.insertBefore(messageDiv, signupForm.firstChild);
}

// Form submit event
signupForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Get input values
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const address = document.getElementById('address');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const signupButton = this.querySelector('button[type="submit"]');

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

    // Validate phone
    if (phone.value.trim() === '') {
        showError(phone, 'Phone number is required.');
        valid = false;
    } else if (!isValidPhone(phone.value.trim())) {
        showError(phone, 'Please enter a valid 10-digit phone number.');
        valid = false;
    } else {
        clearError(phone);
    }

    // Validate address
    if (address.value.trim() === '') {
        showError(address, 'Delivery address is required.');
        valid = false;
    } else {
        clearError(address);
    }

    // Validate password
    if (password.value.trim() === '') {
        showError(password, 'Password is required.');
        valid = false;
    } else if (password.value.length < 6) {
        showError(password, 'Password must be at least 6 characters.');
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

    // If all validations pass, make API call
    if (valid) {
        setLoading(signupButton, true);

        try {
            const signupData = {
                name: name.value.trim(),
                email: email.value.trim(),
                phone: phone.value.trim(),
                address: address.value.trim(), // Added address field
                password: password.value,
                confirmPassword: confirmPassword.value
            };

            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(signupData)
            });

            const data = await response.json();

            if (response.ok) {
                showMessage('Account created successfully! Redirecting to login...', false);
                
                // Clear form
                signupForm.reset();
                
                // Redirect to login page after 2 seconds
                setTimeout(() => {
                    window.location.href = '/customer_login';
                }, 2000);
                
            } else {
                showMessage(data.error || 'Signup failed!', true);
            }
        } catch (error) {
            console.error('Signup error:', error);
            showMessage('An error occurred during signup. Please try again.', true);
        } finally {
            setLoading(signupButton, false);
        }
    }
});

// Real-time validation
const inputs = [
    { id: 'name', validator: (value) => value.trim() !== '' },
    { id: 'email', validator: isValidEmail },
    { id: 'phone', validator: isValidPhone },
    { id: 'address', validator: (value) => value.trim() !== '' },
    { id: 'password', validator: (value) => value.length >= 6 }
];

inputs.forEach(inputConfig => {
    const input = document.getElementById(inputConfig.id);
    if (input) {
        input.addEventListener('input', function() {
            if (this.value.trim() === '') {
                showError(this, 'This field is required.');
            } else if (!inputConfig.validator(this.value.trim())) {
                const message = inputConfig.id === 'email' ? 'Please enter a valid email.' :
                              inputConfig.id === 'phone' ? 'Please enter a valid 10-digit phone number.' :
                              inputConfig.id === 'password' ? 'Password must be at least 6 characters.' :
                              'Please enter a valid value.';
                showError(this, message);
            } else {
                clearError(this);
            }
        });
    }
});

// Confirm password real-time validation
document.getElementById('confirmPassword').addEventListener('input', function() {
    const password = document.getElementById('password').value;
    if (this.value.trim() === '') {
        showError(this, 'Please confirm your password.');
    } else if (this.value !== password) {
        showError(this, 'Passwords do not match.');
    } else {
        clearError(this);
    }
});