// reservation.js - Real-time validation + backend connected (final version)

document.addEventListener("DOMContentLoaded", () => {
  const reservationForm = document.getElementById("reservationForm");
  if (!reservationForm) return;

  const BASE_URL = "http://127.0.0.1:5000";
  const ENDPOINTS = ["/v1/reservations", "/reservations"];

  const dateInput = document.getElementById("date");
  const timeInput = document.getElementById("time");
  const guestsInput = document.getElementById("guests");
  const guestWarning = document.querySelector(".guest-warning");

  const today = new Date().toISOString().split("T")[0];
  dateInput.min = today;

  timeInput.min = "10:00";
  timeInput.max = "22:00";

  guestsInput.addEventListener("change", () => {
    let g = parseInt(guestsInput.value);
    guestWarning.style.display = g > 9 ? "block" : "none";
  });

  const requiredInputs = reservationForm.querySelectorAll(
    "input[required], select[required]"
  );

  requiredInputs.forEach((input) => {
    input.addEventListener("blur", () => validateField(input));
    input.addEventListener("input", () => validateField(input));
    if (input.tagName === "SELECT") {
      input.addEventListener("change", () => validateField(input));
    }
  });

  function validateField(field) {
    const value = field.value.trim();
    let message = "";

    if (field.required && !value) {
      message = "This field is required";
    }

    if (!message && field.type === "email") {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!pattern.test(value)) message = "Enter a valid email";
    }

    if (!message && field.id === "phone") {
      const digits = value.replace(/\D/g, "");
      if (digits.length !== 10) message = "Phone must be exactly 10 digits";
    }

    if (!message && field.id === "time") {
      if (value < "10:00" || value > "22:00") {
        message = "Time must be between 10:00–22:00";
      }
    }

    if (!message && field.id === "guests") {
      const g = parseInt(value);
      if (g < 1 || g > 9) {
        message = "Guests must be between 1 and 9";
      }
    }

    if (message) return showError(field, message);
    return clearError(field);
  }

  function showError(field, message) {
    field.style.borderColor = "#ff4444";

    let err = field.parentNode.querySelector(".error-message");
    if (!err) {
      err = document.createElement("div");
      err.className = "error-message";
      field.parentNode.appendChild(err);
    }

    err.textContent = message;
    err.style.display = "block";
    return false;
  }

  function clearError(field) {
    field.style.borderColor = "#ddd";
    const err = field.parentNode.querySelector(".error-message");
    if (err) err.style.display = "none";
    return true;
  }

  function validateForm() {
    let valid = true;
    requiredInputs.forEach((field) => {
      if (!validateField(field)) valid = false;
    });
    return valid;
  }

  reservationForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showNotification("Please fix errors before submitting", "error");
      return;
    }

    await submitReservation();
  });

  async function submitReservation() {
    const submitBtn = document.querySelector(".submit-btn");
    const original = submitBtn.textContent;

    submitBtn.textContent = "Saving...";
    submitBtn.disabled = true;

    const data = {
      full_name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      guests: guestsInput.value,
      date: dateInput.value,
      time: timeInput.value,
      notes: document.getElementById("requests").value.trim(),
    };

    try {
      let lastError = null;

      for (let endpoint of ENDPOINTS) {
        try {
          const response = await fetch(BASE_URL + endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

          if (response.status === 404) continue;

          const res = await response.json();

          if (response.ok) {
            showNotification("Reservation created successfully!", "success");
            reservationForm.reset();
            submitBtn.textContent = original;
            submitBtn.disabled = false;
            return;
          }

          lastError = res.message || res.errors;
        } catch (inner) {
          lastError = inner;
        }
      }

      showNotification("Failed: " + lastError, "error");
    } catch {
      showNotification("Backend not responding.", "error");
    }

    submitBtn.textContent = original;
    submitBtn.disabled = false;
  }

  /* --- Notification system (same as contact.js) --- */
  function showNotification(message, type = "info") {
    const notice = document.createElement("div");
    notice.className = `notification ${type}`;
    notice.innerHTML = `
      <span>${message}</span>
      <button class="notification-close">&times;</button>
    `;

    if (!document.querySelector("#notification-styles")) {
      const style = document.createElement("style");
      style.id = "notification-styles";
      style.textContent = `
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
          max-width: 350px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          animation: slideIn 0.3s ease;
        }
        .notification.success { background: #4CAF50; }
        .notification.error { background: #ff4444; }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notice);

    notice.querySelector(".notification-close").onclick = () => notice.remove();

    setTimeout(() => notice.remove(), 5000);
  }
});

