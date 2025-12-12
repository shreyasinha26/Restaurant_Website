// reservation.js - Simple Working Version
document.addEventListener('DOMContentLoaded', function() {
  console.log('Reservation page loaded');
  
  const form = document.getElementById('reservationForm');
  if (!form) {
    console.error('Form not found!');
    return;
  }
  
  // Set today as min date
  const dateInput = document.getElementById('date');
  const timeInput = document.getElementById('time');
  
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today; // Default to today
  }
  
  if (timeInput) {
    // Set time constraints
    timeInput.min = '10:00';
    timeInput.max = '22:00';
    
    // Set default time (next hour or 12:00)
    const now = new Date();
    let nextHour = now.getHours() + 1;
    if (nextHour < 10) nextHour = 12;
    if (nextHour > 22) nextHour = 12;
    
    timeInput.value = nextHour.toString().padStart(2, '0') + ':00';
  }
  
  // Simple validation on blur
  const inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      validateSingleField(this);
    });
    
    // Clear error when typing
    input.addEventListener('input', function() {
      const errorSpan = this.parentElement.querySelector('.error-message');
      if (errorSpan) {
        errorSpan.style.display = 'none';
        this.classList.remove('error-field');
      }
    });
  });
  
  // Validation function for single field
  function validateSingleField(field) {
    const value = field.value.trim();
    const errorSpan = field.parentElement.querySelector('.error-message');
    
    if (!errorSpan) return true;
    
    // Clear previous error
    errorSpan.style.display = 'none';
    field.classList.remove('error-field');
    
    // Check if required and empty
    if (field.hasAttribute('required') && !value) {
      showError(field, 'This field is required');
      return false;
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
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          showError(field, 'Enter a valid email address');
          return false;
        }
        break;
        
      case 'phone':
        if (value && value.replace(/\D/g, '').length !== 10) {
          showError(field, 'Enter a 10-digit phone number');
          return false;
        }
        break;
        
      case 'guests':
        const guests = parseInt(value);
        if (value && (guests < 1 || guests > 9)) {
          showError(field, 'Select 1-9 guests');
          return false;
        }
        break;
        
      case 'date':
        if (value) {
          const selected = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (selected < today) {
            showError(field, 'Date cannot be in the past');
            return false;
          }
        }
        break;
        
      case 'time':
        if (value && (value < '10:00' || value > '22:00')) {
          showError(field, 'Time must be 10:00-22:00');
          return false;
        }
        break;
    }
    
    return true;
  }
  
  function showError(field, message) {
    const errorSpan = field.parentElement.querySelector('.error-message');
    if (errorSpan) {
      errorSpan.textContent = message;
      errorSpan.style.display = 'block';
      field.classList.add('error-field');
    }
  }
  
  // Form submission
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    console.log('Form submission started');
    
    // Validate all fields
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
      if (!validateSingleField(field)) {
        isValid = false;
      }
    });
    
    if (!isValid) {
      showPopup('Please fix errors in form', 'error');
      return;
    }
    
    // Prepare data
    const formData = {
      full_name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      guests: document.getElementById('guests').value,
      date: document.getElementById('date').value,
      time: document.getElementById('time').value,
      notes: document.getElementById('requests').value.trim()
    };
    
    console.log('Submitting:', formData);
    
    // Disable submit button
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Processing...';
    
    try {
      // API endpoint
      const API_PREFIX = window.location.pathname.startsWith('/app') ? '/app' : '';
      const BASE_URL = API_PREFIX + '/api/reservations';
      
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        showPopup('Reservation created successfully!', 'success');
        form.reset();
        
        // Reset date/time defaults
        if (dateInput) {
          dateInput.value = new Date().toISOString().split('T')[0];
        }
        if (timeInput) {
          const now = new Date();
          let nextHour = now.getHours() + 1;
          if (nextHour < 10) nextHour = 12;
          if (nextHour > 22) nextHour = 12;
          timeInput.value = nextHour.toString().padStart(2, '0') + ':00';
        }
        
        // Clear all errors
        form.querySelectorAll('.error-message').forEach(el => {
          el.style.display = 'none';
        });
        form.querySelectorAll('.error-field').forEach(el => {
          el.classList.remove('error-field');
        });
        
      } else {
        showPopup(result.message || 'Reservation failed', 'error');
      }
      
    } catch (error) {
      console.error('Error:', error);
      showPopup('Network error. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
  
  // Popup notification
  function showPopup(message, type) {
    // Remove existing popups
    document.querySelectorAll('.popup-notification').forEach(el => el.remove());
    
    const popup = document.createElement('div');
    popup.className = `popup-notification ${type}`;
    popup.textContent = message;
    
    popup.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      background: ${type === 'success' ? '#4CAF50' : '#E74C3C'};
      color: white;
      border-radius: 8px;
      font-weight: 600;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(popup);
    
    setTimeout(() => {
      popup.remove();
    }, 4000);
  }
  
  // Add animation CSS
  if (!document.querySelector('#popup-animation')) {
    const style = document.createElement('style');
    style.id = 'popup-animation';
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
    `;
    document.head.appendChild(style);
  }
});