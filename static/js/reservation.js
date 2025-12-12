// reservation.js - Complete working version with inline validation
document.addEventListener('DOMContentLoaded', function() {
  console.log('Reservation page loaded');
  
  // Get the form
  const form = document.getElementById('reservationForm');
  if (!form) {
    console.error('Form not found');
    return;
  }
  
  // Get form elements
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const guestsInput = document.getElementById('guests');
  const dateInput = document.getElementById('date');
  const timeInput = document.getElementById('time');
  const requestsInput = document.getElementById('requests');
  
  // Set minimum date to today
  if (dateInput) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    dateInput.min = `${year}-${month}-${day}`;
  }
  
  // Set time constraints
  if (timeInput) {
    timeInput.min = '10:00';
    timeInput.max = '22:00';
  }
  
  // Real-time validation for each field
  const inputs = form.querySelectorAll('input, select, textarea');
  
  inputs.forEach(input => {
    // Validate when user leaves the field
    input.addEventListener('blur', function() {
      validateField(this);
    });
    
    // Clear error when user starts typing (for required fields)
    if (input.hasAttribute('required')) {
      input.addEventListener('input', function() {
        if (this.classList.contains('error-field')) {
          clearError(this);
        }
      });
    }
    
    // For select elements, validate on change
    if (input.tagName === 'SELECT') {
      input.addEventListener('change', function() {
        validateField(this);
      });
    }
  });
  
  // Validation functions
  function validateField(field) {
    const value = field.value.trim();
    const errorSpan = field.parentElement.querySelector('.error-message');
    
    if (!errorSpan) return true;
    
    // Clear previous error
    errorSpan.textContent = '';
    errorSpan.style.display = 'none';
    field.classList.remove('error-field');
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
      showError(field, 'This field is required');
      return false;
    }
    
    // Skip further validation if field is empty but not required
    if (!value && !field.hasAttribute('required')) {
      return true;
    }
    
    // Field-specific validations
    switch(field.id) {
      case 'name':
        if (value.length < 2) {
          showError(field, 'Name must be at least 2 characters');
          return false;
        }
        break;
        
      case 'email':
        if (!isValidEmail(value)) {
          showError(field, 'Please enter a valid email address');
          return false;
        }
        break;
        
      case 'phone':
        if (!isValidPhone(value)) {
          showError(field, 'Please enter a valid phone number (10 digits)');
          return false;
        }
        break;
        
      case 'guests':
        const guests = parseInt(value);
        if (isNaN(guests) || guests < 1 || guests > 9) {
          showError(field, 'Please select 1-9 guests');
          return false;
        }
        break;
        
      case 'date':
        if (!isValidDate(value)) {
          showError(field, 'Please select a valid date');
          return false;
        }
        break;
        
      case 'time':
        if (!isValidTime(value)) {
          showError(field, 'Please select time between 10:00-22:00');
          return false;
        }
        break;
    }
    
    return true;
  }
  
  // Helper validation functions
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  function isValidPhone(phone) {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10;
  }
  
  function isValidDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if date is valid and not in the past
    return date instanceof Date && !isNaN(date) && date >= today;
  }
  
  function isValidTime(timeString) {
    if (!timeString) return false;
    const time = timeString.split(':');
    const hour = parseInt(time[0]);
    return hour >= 10 && hour <= 22;
  }
  
  // Error display functions
  function showError(field, message) {
    const errorSpan = field.parentElement.querySelector('.error-message');
    if (errorSpan) {
      errorSpan.textContent = message;
      errorSpan.style.display = 'block';
      field.classList.add('error-field');
    }
  }
  
  function clearError(field) {
    const errorSpan = field.parentElement.querySelector('.error-message');
    if (errorSpan) {
      errorSpan.textContent = '';
      errorSpan.style.display = 'none';
      field.classList.remove('error-field');
    }
  }
  
  // Form submission handler
  form.addEventListener('submit', async function(event) {
    event.preventDefault();
    console.log('Form submission started');
    
    // Validate all fields before submission
    let formIsValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
      if (!validateField(field)) {
        formIsValid = false;
      }
    });
    
    if (!formIsValid) {
      // Show error message and scroll to first error
      showNotification('Please fix all errors before submitting.', 'error');
      const firstError = document.querySelector('.error-field');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    // Prepare form data
    const formData = {
      full_name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      guests: guestsInput.value,
      date: dateInput.value,
      time: timeInput.value,
      notes: requestsInput.value.trim()
    };
    
    console.log('Form data:', formData);
    
    // Disable submit button to prevent double submission
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    
    try {
      // Determine API endpoint
      const API_PREFIX = window.location.pathname.startsWith('/app') ? '/app' : '';
      const BASE_URL = API_PREFIX + '/api/reservations';
      
      // Send reservation data
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Success
        showNotification('Reservation created successfully!', 'success');
        
        // Reset form
        form.reset();
        
        // Clear all error messages
        inputs.forEach(input => clearError(input));
        
        // Reset date to today
        if (dateInput) {
          const today = new Date();
          const year = today.getFullYear();
          const month = String(today.getMonth() + 1).padStart(2, '0');
          const day = String(today.getDate()).padStart(2, '0');
          dateInput.value = `${year}-${month}-${day}`;
        }
        
        // Reset time to default
        if (timeInput) {
          timeInput.value = '12:00';
        }
        
      } else {
        // Server error
        showNotification(result.message || 'Failed to create reservation. Please try again.', 'error');
      }
      
    } catch (error) {
      // Network error
      console.error('Error:', error);
      showNotification('Network error. Please check your connection and try again.', 'error');
    } finally {
      // Re-enable submit button
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
  
  // Notification system
  function showNotification(message, type) {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 25px;
      background-color: ${type === 'success' ? '#4CAF50' : '#f44336'};
      color: white;
      border-radius: 8px;
      font-weight: 600;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
      max-width: 400px;
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 5000);
  }
  
  // Add animation styles if not already present
  if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(100%);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes slideOut {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(100%);
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Initialize the form with today's date
  if (dateInput) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    dateInput.value = `${year}-${month}-${day}`;
  }
  
  console.log('Reservation form initialized successfully');
});