// contact.js - Enhanced Contact Page Functionality

document.addEventListener("DOMContentLoaded", function () {
    // Form handling and validation
    const contactForm = document.getElementById("contactForm");
    const locationSelect = document.getElementById("location");
    
    // Auto-populate phone number based on location selection
    if (locationSelect) {
        locationSelect.addEventListener("change", function() {
            updateContactInfo(this.value);
        });
    }

    // Contact information mapping
    const locationInfo = {
        helsinki: {
            phone: "+358 40 123 4567",
            address: "Aleksanterinkatu 15, 00100 Helsinki",
            hours: "Mon-Thu: 11:00-22:00, Fri-Sat: 11:00-23:00, Sun: 12:00-21:00"
        },
        turku: {
            phone: "+358 40 123 4568",
            address: "Aurakatu 8, 20100 Turku",
            hours: "Mon-Thu: 11:00-22:00, Fri-Sat: 11:00-23:00, Sun: 12:00-21:00"
        },
        espoo: {
            phone: "+358 40 123 4569",
            address: "Tapiontori 4, 02100 Espoo",
            hours: "Mon-Thu: 11:00-22:00, Fri-Sat: 11:00-23:00, Sun: 12:00-21:00"
        },
        tampere: {
            phone: "+358 40 123 4570",
            address: "Hämeenkatu 30, 33100 Tampere",
            hours: "Mon-Thu: 11:00-22:00, Fri-Sat: 11:00-23:00, Sun: 12:00-21:00"
        }
    };

    function updateContactInfo(location) {
        const phoneInput = document.getElementById("phone");
        if (phoneInput && locationInfo[location]) {
            phoneInput.value = locationInfo[location].phone;
            phoneInput.setAttribute("data-suggested", "true");
        }
    }

    // Form validation and submission
    if (contactForm) {
        contactForm.addEventListener("submit", function (e) {
            e.preventDefault();
            
            if (validateForm()) {
                submitForm();
            }
        });

        // Real-time validation
        const formInputs = contactForm.querySelectorAll("input, select, textarea");
        formInputs.forEach(input => {
            input.addEventListener("blur", function() {
                validateField(this);
            });
            
            input.addEventListener("input", function() {
                clearFieldError(this);
            });
        });
    }

    function validateForm() {
        let isValid = true;
        const requiredFields = contactForm.querySelectorAll("[required]");
        
        requiredFields.forEach(field => {
            if (!validateField(field)) {
                isValid = false;
            }
        });

        return isValid;
    }

    function validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = "";

        // Clear previous error
        clearFieldError(field);

        // Required field validation
        if (field.hasAttribute("required") && !value) {
            errorMessage = "This field is required";
            isValid = false;
        } 
        // Email validation
        else if (field.type === "email" && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                errorMessage = "Please enter a valid email address";
                isValid = false;
            }
        }
        // Phone validation
        else if (field.type === "tel" && value) {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]+$/;
            if (!phoneRegex.test(value)) {
                errorMessage = "Please enter a valid phone number";
                isValid = false;
            }
        }

        if (!isValid) {
            showFieldError(field, errorMessage);
        }

        return isValid;
    }

    function showFieldError(field, message) {
        field.style.borderColor = "#ff4444";
        
        // Create or update error message
        let errorElement = field.parentNode.querySelector(".error-message");
        if (!errorElement) {
            errorElement = document.createElement("div");
            errorElement.className = "error-message";
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = "block";
    }

    function clearFieldError(field) {
        field.style.borderColor = "#ddd";
        
        const errorElement = field.parentNode.querySelector(".error-message");
        if (errorElement) {
            errorElement.style.display = "none";
        }
    }

    function submitForm() {
        const submitBtn = contactForm.querySelector(".submit-btn");
        const originalText = submitBtn.textContent;
        
        // Show loading state
        submitBtn.textContent = "Sending...";
        submitBtn.disabled = true;
        
        // Simulate form submission
        setTimeout(() => {
            // In a real application, you would send data to a server here
            const formData = new FormData(contactForm);
            const formObject = Object.fromEntries(formData.entries());
            
            console.log("Form submitted:", formObject);
            
            // Show success message
            showNotification("Message sent successfully! We'll get back to you soon.", "success");
            
            // Reset form
            contactForm.reset();
            
            // Restore button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            
        }, 1500);
    }

    // Notification system
    function showNotification(message, type = "info") {
        const notification = document.createElement("div");
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        `;
        
        // Add styles if not already added
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 15px 20px;
                    border-radius: 8px;
                    color: white;
                    z-index: 1000;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    max-width: 400px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    animation: slideIn 0.3s ease;
                }
                .notification.success { background: #4CAF50; }
                .notification.error { background: #ff4444; }
                .notification.info { background: #2196F3; }
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 1.2rem;
                    cursor: pointer;
                    padding: 0;
                    width: 20px;
                    height: 20px;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(styles);
        }
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
        
        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }

    // Interactive FAQ section
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        item.addEventListener('click', function() {
            // Toggle active state
            this.classList.toggle('active');
            
            // Add styles for FAQ interaction
            if (!document.querySelector('#faq-styles')) {
                const faqStyles = document.createElement('style');
                faqStyles.id = 'faq-styles';
                faqStyles.textContent = `
                    .faq-item {
                        cursor: pointer;
                        transition: all 0.3s ease;
                    }
                    .faq-item.active {
                        background: #fff8f0;
                        border-left: 4px solid #ff7b00;
                    }
                    .faq-item p {
                        max-height: 0;
                        overflow: hidden;
                        transition: max-height 0.3s ease;
                    }
                    .faq-item.active p {
                        max-height: 200px;
                    }
                `;
                document.head.appendChild(faqStyles);
            }
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Responsive navigation enhancement
    const header = document.querySelector('.site-header');
    const nav = document.querySelector('nav');
    
    // Add mobile menu toggle for smaller screens
    function setupMobileMenu() {
        if (window.innerWidth <= 768 && !document.querySelector('.menu-toggle')) {
            const menuToggle = document.createElement('button');
            menuToggle.className = 'menu-toggle';
            menuToggle.innerHTML = '☰';
            menuToggle.setAttribute('aria-label', 'Toggle menu');
            
            // Add mobile menu styles
            if (!document.querySelector('#mobile-menu-styles')) {
                const mobileStyles = document.createElement('style');
                mobileStyles.id = 'mobile-menu-styles';
                mobileStyles.textContent = `
                    .menu-toggle {
                        display: none;
                        background: none;
                        border: none;
                        color: #ff7b00;
                        font-size: 1.5rem;
                        cursor: pointer;
                        padding: 5px;
                    }
                    @media (max-width: 768px) {
                        .menu-toggle {
                            display: block;
                        }
                        nav ul {
                            display: none;
                            position: absolute;
                            top: 100%;
                            left: 0;
                            right: 0;
                            background: #1b1b1b;
                            flex-direction: column;
                            padding: 20px;
                        }
                        nav ul.show {
                            display: flex;
                        }
                    }
                `;
                document.head.appendChild(mobileStyles);
            }
            
            header.appendChild(menuToggle);
            
            menuToggle.addEventListener('click', function() {
                nav.querySelector('ul').classList.toggle('show');
            });
        }
    }

    // Initialize mobile menu
    setupMobileMenu();
    window.addEventListener('resize', setupMobileMenu);

    // Add loading animation for better UX
    function addLoadingAnimation() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
            .loading {
                animation: pulse 1.5s ease-in-out infinite;
            }
        `;
        document.head.appendChild(style);
    }

    addLoadingAnimation();
});