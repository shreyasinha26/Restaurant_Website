document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("reservationForm");
  if (!form) return;

  const API_PREFIX = window.location.pathname.startsWith("/app") ? "/app" : "";
  const BASE_URL = API_PREFIX + "/api/reservations";

  // Set min date to today
  const dateInput = document.getElementById("date");
  const timeInput = document.getElementById("time");
  
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
  }
  
  if (timeInput) {
    timeInput.min = "10:00";
    timeInput.max = "22:00";
  }

  // Validation functions
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePhone(phone) {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10;
  }

  function validateField(field) {
    const value = field.value.trim();
    const errorDiv = field.parentNode.querySelector('.error-message');
    
    if (!errorDiv) return true;
    
    // Clear previous error
    errorDiv.textContent = '';
    field.classList.remove('error-field');
    
    // Required field check
    if (field.required && !value) {
      errorDiv.textContent = 'This field is required';
      field.classList.add('error-field');
      return false;
    }
    
    // Field-specific validations
    switch(field.id) {
      case 'email':
        if (value && !validateEmail(value)) {
          errorDiv.textContent = 'Please enter a valid email address';
          field.classList.add('error-field');
          return false;
        }
        break;
        
      case 'phone':
        if (value && !validatePhone(value)) {
          errorDiv.textContent = 'Please enter a valid 10-digit phone number';
          field.classList.add('error-field');
          return false;
        }
        break;
        
      case 'name':
        if (value.length < 2) {
          errorDiv.textContent = 'Name must be at least 2 characters';
          field.classList.add('error-field');
          return false;
        }
        break;
        
      case 'guests':
        const guests = parseInt(value);
        if (guests < 1 || guests > 9) {
          errorDiv.textContent = 'Number of guests must be 1-9';
          field.classList.add('error-field');
          return false;
        }
        break;
        
      case 'date':
        if (value) {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (selectedDate < today) {
            errorDiv.textContent = 'Date cannot be in the past';
            field.classList.add('error-field');
            return false;
          }
        }
        break;
        
      case 'time':
        if (value && (value < '10:00' || value > '22:00')) {
          errorDiv.textContent = 'Time must be between 10:00 and 22:00';
          field.classList.add('error-field');
          return false;
        }
        break;
    }
    
    return true;
  }

  // Real-time validation on blur
  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    
    // For select elements, validate on change
    if (field.tagName === 'SELECT') {
      field.addEventListener('change', () => validateField(field));
    }
  });

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate all fields
    let isValid = true;
    form.querySelectorAll('input[required], select[required]').forEach(field => {
      if (!validateField(field)) {
        isValid = false;
      }
    });
    
    if (!isValid) {
      showNotification('Please fix all errors before submitting.', 'error');
      return;
    }
    
    // Submit form
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    
    const formData = {
      full_name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      guests: document.getElementById('guests').value,
      date: document.getElementById('date').value,
      time: document.getElementById('time').value,
      notes: document.getElementById('requests').value.trim()
    };
    
    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        showNotification('Reservation created successfully!', 'success');
        form.reset();
        // Clear all error messages
        form.querySelectorAll('.error-message').forEach(el => {
          el.textContent = '';
          el.previousElementSibling?.classList.remove('error-field');
        });
      } else {
        showNotification(result.message || 'Failed to create reservation.', 'error');
      }
    } catch (error) {
      showNotification('Network error. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });

  // Notification function
  function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
});