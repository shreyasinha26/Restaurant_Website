// contact.js - Real-time required validation + Backend connected

document.addEventListener("DOMContentLoaded", () => {

  const contactForm = document.getElementById("contactForm");
  const locationSelect = document.getElementById("location");

  if (!contactForm) return;

  /* ============================================================
     LOCATION → AUTO PHONE FILL (Helsinki only)
  ============================================================ */

  const locationInfo = {
    helsinki: {
      phone: "+358 40 123 4567",
      address: "Aleksanterinkatu 15, 00100 Helsinki",
      hours: "Mon-Thu: 11:00-22:00, Fri-Sat: 11:00-23:00, Sun: 12:00-21:00",
    },
  };

  function updateContactInfo(location) {
    const phoneInput = document.getElementById("phone");
    if (phoneInput && locationInfo[location]) {
      phoneInput.value = locationInfo[location].phone;
      phoneInput.setAttribute("data-suggested", "true");
    }
  }

  if (locationSelect) {
    locationSelect.addEventListener("change", function () {
      updateContactInfo(this.value);
      validateRequired(this);
    });
  }

  /* ============================================================
     REAL-TIME VALIDATION (uses HTML required)
  ============================================================ */

  const requiredInputs = contactForm.querySelectorAll(
    "input[required], textarea[required], select[required]"
  );

  requiredInputs.forEach((input) => {
    // validate on blur (when leaving field)
    input.addEventListener("blur", () => validateRequired(input));

    // validate while typing (real-time)
    input.addEventListener("input", () => validateRequired(input));

    // validate select immediately on change
    if (input.tagName.toLowerCase() === "select") {
      input.addEventListener("change", () => validateRequired(input));
    }
  });

  function validateRequired(field) {
    const value = field.value.trim();
    let errorMessage = "";

    // Required check
    if (field.hasAttribute("required") && value === "") {
      errorMessage = "This field is required";
    }

    // Email format check
    if (!errorMessage && field.type === "email" && value !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errorMessage = "Please enter a valid email";
      }
    }

    // Phone format check
    if (!errorMessage && field.type === "tel" && value !== "") {
      const phoneRegex = /^[+]?[0-9\s\-()]+$/;
      if (!phoneRegex.test(value)) {
        errorMessage = "Please enter a valid phone number";
      }
    }

    if (errorMessage) {
      showFieldError(field, errorMessage);
      return false;
    } else {
      clearFieldError(field);
      return true;
    }
  }

  function validateForm() {
    let isValid = true;
    requiredInputs.forEach((field) => {
      if (!validateRequired(field)) isValid = false;
    });
    return isValid;
  }

  function showFieldError(field, message) {
    field.style.borderColor = "#ff4444";

    let errorEl = field.parentNode.querySelector(".error-message");
    if (!errorEl) {
      errorEl = document.createElement("div");
      errorEl.className = "error-message";
      field.parentNode.appendChild(errorEl);
    }

    errorEl.textContent = message;
    errorEl.style.display = "block";
  }

  function clearFieldError(field) {
    field.style.borderColor = "#ddd";
    const errorEl = field.parentNode.querySelector(".error-message");
    if (errorEl) errorEl.style.display = "none";
  }

  /* ============================================================
     BACKEND SUBMIT (Flask)
  ============================================================ */

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showNotification("Please fix errors before submitting.", "error");
      return;
    }

    await submitFormToBackend();
  });

  async function submitFormToBackend() {
    const submitBtn = contactForm.querySelector(".submit-btn");
    const originalText = submitBtn.textContent;

    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;

    const contactData = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      location: document.getElementById("location").value,
      subject: document.getElementById("subject").value.trim(),
      message: document.getElementById("message").value.trim(),
    };

    try {
      const response = await fetch("http://127.0.0.1:5000/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactData),
      });

      const result = await response.json();

      if (response.ok) {
        showNotification(
          "Message sent successfully! We'll get back to you soon.",
          "success"
        );
        contactForm.reset();
      } else {
        showNotification(
          "Failed to send message: " + (result.message || "Try again."),
          "error"
        );
      }
    } catch (err) {
      showNotification("Server not responding. Start your backend!", "error");
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  /* ============================================================
     NOTIFICATION SYSTEM
  ============================================================ */

  function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <span class="notification-message">${message}</span>
      <button class="notification-close">&times;</button>
    `;

    if (!document.querySelector("#notification-styles")) {
      const styles = document.createElement("style");
      styles.id = "notification-styles";
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

    setTimeout(() => {
      if (notification.parentNode) notification.remove();
    }, 5000);

    notification
      .querySelector(".notification-close")
      .addEventListener("click", () => notification.remove());
  }

  /* ============================================================
     FAQ TOGGLE
  ============================================================ */

  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    item.addEventListener("click", function () {
      this.classList.toggle("active");
    });
  });

  /* ============================================================
     SMOOTH SCROLL
  ============================================================ */

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ============================================================
     MOBILE MENU
  ============================================================ */

  const header = document.querySelector(".site-header");
  const nav = document.querySelector("nav");

  function setupMobileMenu() {
    if (window.innerWidth <= 768 && !document.querySelector(".menu-toggle")) {
      const menuToggle = document.createElement("button");
      menuToggle.className = "menu-toggle";
      menuToggle.innerHTML = "☰";
      menuToggle.setAttribute("aria-label", "Toggle menu");

      if (!document.querySelector("#mobile-menu-styles")) {
        const mobileStyles = document.createElement("style");
        mobileStyles.id = "mobile-menu-styles";
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
            .menu-toggle { display: block; }
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
            nav ul.show { display: flex; }
          }
        `;
        document.head.appendChild(mobileStyles);
      }

      header.appendChild(menuToggle);

      menuToggle.addEventListener("click", () => {
        nav.querySelector("ul").classList.toggle("show");
      });
    }
  }

  setupMobileMenu();
  window.addEventListener("resize", setupMobileMenu);
});
// contact.js - Real-time required validation + Backend connected (v1 + non-v1 support)

document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm");
  const locationSelect = document.getElementById("location");

  if (!contactForm) return;

  /* ============================================================
     CONFIG: backend endpoints
     - tries /v1/contact first (teacher style)
     - falls back to /contact (old style)
  ============================================================ */
  const BASE_URL = "http://127.0.0.1:5000";
  const ENDPOINTS = ["/v1/contact", "/contact"];

  /* ============================================================
     LOCATION → AUTO PHONE FILL (Helsinki only)
  ============================================================ */
  const locationInfo = {
    helsinki: {
      phone: "+358 40 123 4567",
      address: "Aleksanterinkatu 15, 00100 Helsinki",
      hours: "Mon-Thu: 11:00-22:00, Fri-Sat: 11:00-23:00, Sun: 12:00-21:00",
    },
  };

  function updateContactInfo(location) {
    const phoneInput = document.getElementById("phone");
    if (phoneInput && locationInfo[location]) {
      phoneInput.value = locationInfo[location].phone;
      phoneInput.setAttribute("data-suggested", "true");
    }
  }

  if (locationSelect) {
    locationSelect.addEventListener("change", function () {
      updateContactInfo(this.value);
      validateRequired(this);
    });
  }

  /* ============================================================
     REAL-TIME VALIDATION (HTML required + format checks)
  ============================================================ */
  const requiredInputs = contactForm.querySelectorAll(
    "input[required], textarea[required], select[required]"
  );

  requiredInputs.forEach((input) => {
    input.addEventListener("blur", () => validateRequired(input));
    input.addEventListener("input", () => validateRequired(input));

    if (input.tagName.toLowerCase() === "select") {
      input.addEventListener("change", () => validateRequired(input));
    }
  });

  function validateRequired(field) {
    const value = field.value.trim();
    let errorMessage = "";

    if (field.hasAttribute("required") && value === "") {
      errorMessage = "This field is required";
    }

    if (!errorMessage && field.type === "email" && value !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errorMessage = "Please enter a valid email";
      }
    }

    if (!errorMessage && field.type === "tel" && value !== "") {
      const phoneRegex = /^[+]?[0-9\s\-()]+$/;
      if (!phoneRegex.test(value)) {
        errorMessage = "Please enter a valid phone number";
      }
    }

    if (errorMessage) {
      showFieldError(field, errorMessage);
      return false;
    } else {
      clearFieldError(field);
      return true;
    }
  }

  function validateForm() {
    let isValid = true;
    requiredInputs.forEach((field) => {
      if (!validateRequired(field)) isValid = false;
    });
    return isValid;
  }

  function showFieldError(field, message) {
    field.style.borderColor = "#ff4444";

    let errorEl = field.parentNode.querySelector(".error-message");
    if (!errorEl) {
      errorEl = document.createElement("div");
      errorEl.className = "error-message";
      field.parentNode.appendChild(errorEl);
    }

    errorEl.textContent = message;
    errorEl.style.display = "block";
  }

  function clearFieldError(field) {
    field.style.borderColor = "#ddd";
    const errorEl = field.parentNode.querySelector(".error-message");
    if (errorEl) errorEl.style.display = "none";
  }

  /* ============================================================
     BACKEND SUBMIT (tries /v1/contact then /contact)
  ============================================================ */
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showNotification("Please fix errors before submitting.", "error");
      return;
    }

    await submitFormToBackend();
  });

  async function submitFormToBackend() {
    const submitBtn = contactForm.querySelector(".submit-btn");
    const originalText = submitBtn.textContent;

    submitBtn.textContent = "Sending...";
    submitBtn.disabled = true;

    const contactData = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      subject: document.getElementById("subject").value.trim(),
      message: document.getElementById("message").value.trim(),
    };

    try {
      let lastError = null;

      for (const ep of ENDPOINTS) {
        try {
          const response = await fetch(BASE_URL + ep, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(contactData),
          });

          // If route doesn't exist, try next endpoint
          if (response.status === 404) continue;

          const result = await response.json();

          if (response.ok) {
            showNotification(
              "Message sent successfully! We'll get back to you soon.",
              "success"
            );
            contactForm.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            return;
          } else {
            lastError = result.message || "Try again.";
          }
        } catch (innerErr) {
          lastError = innerErr;
        }
      }

      showNotification(
        "Failed to send message: " + (lastError || "No backend route found."),
        "error"
      );
    } catch (err) {
      showNotification("Server not responding. Start your backend!", "error");
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  /* ============================================================
     NOTIFICATION SYSTEM
  ============================================================ */
  function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <span class="notification-message">${message}</span>
      <button class="notification-close">&times;</button>
    `;

    if (!document.querySelector("#notification-styles")) {
      const styles = document.createElement("style");
      styles.id = "notification-styles";
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

    setTimeout(() => {
      if (notification.parentNode) notification.remove();
    }, 5000);

    notification
      .querySelector(".notification-close")
      .addEventListener("click", () => notification.remove());
  }

  /* ============================================================
     FAQ TOGGLE
  ============================================================ */
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach((item) => {
    item.addEventListener("click", function () {
      this.classList.toggle("active");
    });
  });

  /* ============================================================
     SMOOTH SCROLL
  ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ============================================================
     MOBILE MENU
  ============================================================ */
  const header = document.querySelector(".site-header");
  const nav = document.querySelector("nav");

  function setupMobileMenu() {
    if (window.innerWidth <= 768 && !document.querySelector(".menu-toggle")) {
      const menuToggle = document.createElement("button");
      menuToggle.className = "menu-toggle";
      menuToggle.innerHTML = "☰";
      menuToggle.setAttribute("aria-label", "Toggle menu");

      if (!document.querySelector("#mobile-menu-styles")) {
        const mobileStyles = document.createElement("style");
        mobileStyles.id = "mobile-menu-styles";
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
            .menu-toggle { display: block; }
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
            nav ul.show { display: flex; }
          }
        `;
        document.head.appendChild(mobileStyles);
      }

      header.appendChild(menuToggle);

      menuToggle.addEventListener("click", () => {
        nav.querySelector("ul").classList.toggle("show");
      });
    }
  }

  setupMobileMenu();
  window.addEventListener("resize", setupMobileMenu);
});
