// reservation.js — Inline Validation + Backend Connection
document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("reservationForm");
  if (!form) return;

  const BASE_URL = "http://127.0.0.1:5000";
  const ENDPOINT = "/reservations";

  const guestsInput = document.getElementById("guests");
  const dateInput = document.getElementById("date");
  const timeInput = document.getElementById("time");
  const guestWarning = document.querySelector(".guest-warning");

  /* ------------------------------------------------------------
     LIMIT DATE + TIME RANGE
  ------------------------------------------------------------ */
  dateInput.min = new Date().toISOString().split("T")[0];
  timeInput.min = "10:00";
  timeInput.max = "22:00";

  /* ------------------------------------------------------------
     INSERT ERROR CONTAINERS BELOW EACH FIELD
  ------------------------------------------------------------ */
  function initErrorContainers() {
    const fields = form.querySelectorAll("input, select, textarea");

    fields.forEach(field => {
      // Insert only if not already added
      if (
        !field.nextElementSibling ||
        !field.nextElementSibling.classList.contains("error-container")
      ) {
        const errorBox = document.createElement("div");
        errorBox.className = "error-container";
        errorBox.innerHTML = `<div class="error-message"></div>`;
        field.insertAdjacentElement("afterend", errorBox);
      }
    });
  }
  initErrorContainers();

  /* ------------------------------------------------------------
     VALIDATION LOGIC
  ------------------------------------------------------------ */
  const requiredFields = form.querySelectorAll("input[required], select[required]");
  const touched = new Set();

  requiredFields.forEach(field => {
    field.addEventListener("blur", () => {
      touched.add(field.id);
      validateField(field);
    });

    field.addEventListener("input", () => {
      if (touched.has(field.id)) validateField(field);
    });

    if (field.tagName === "SELECT") {
      field.addEventListener("change", () => {
        touched.add(field.id);
        validateField(field);
      });
    }
  });

  guestsInput.addEventListener("change", () => {
    let g = parseInt(guestsInput.value);
    guestWarning.style.display = g > 9 ? "block" : "none";

    if (touched.has("guests")) validateField(guestsInput);
  });

  function validateField(field) {
    const value = field.value.trim();
    let msg = "";

    let label = document.querySelector(`label[for="${field.id}"]`);
    let name = label ? label.textContent.replace("*", "").trim() : "This field";

    if (field.required && !value) msg = `${name} is required`;

    // Email validation
    if (!msg && field.type === "email" && value !== "") {
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!valid.test(value)) {
        msg = value.includes("@")
          ? "Please enter a valid email address"
          : "Please enter a valid email";
      }
    }

    // Phone validation
    if (!msg && field.id === "phone" && value !== "") {
      const digits = value.replace(/\D/g, "");
      if (digits.length !== 10) msg = "Please enter a valid 10-digit phone number";
    }

    // Guests limit
    if (!msg && field.id === "guests" && value !== "") {
      const g = parseInt(value);
      if (g < 1 || g > 9) msg = "Guests must be between 1 and 9";
    }

    // Time validation
    if (!msg && field.id === "time" && value !== "") {
      if (value < "10:00" || value > "22:00") msg = "Time must be between 10:00–22:00";
    }

    // Name length
    if (!msg && field.id === "name" && value.length < 2) {
      msg = "Name must be at least 2 characters";
    }

    // Date validation
    if (!msg && field.id === "date" && value !== "") {
      const picked = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (picked < today) msg = "Date cannot be in the past";
    }

    showError(field, msg);
    return !msg;
  }

  /* ------------------------------------------------------------
     SHOW ERROR BELOW FIELD
  ------------------------------------------------------------ */
  function showError(field, message) {
    const errorBox = field.nextElementSibling;
    if (!errorBox) return;

    const text = errorBox.querySelector(".error-message");

    if (message) {
      field.classList.add("error-field");
      text.textContent = message;
      text.style.display = "block";
      errorBox.style.display = "block";
    } else {
      field.classList.remove("error-field");
      text.textContent = "";
      errorBox.style.display = "none";
    }
  }

  /* ------------------------------------------------------------
     FORM VALIDATION + SUBMIT
  ------------------------------------------------------------ */
  function validateForm() {
    let ok = true;
    requiredFields.forEach(f => {
      touched.add(f.id);
      if (!validateField(f)) ok = false;
    });
    return ok;
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();

    if (!validateForm()) {
      showPopup("Please fix the errors before submitting.", "error");

      const first = document.querySelector(".error-field");
      if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });

      return;
    }

    await submitReservation();
  });

  /* ------------------------------------------------------------
     BACKEND REQUEST
  ------------------------------------------------------------ */
  async function submitReservation() {
    const btn = form.querySelector(".submit-btn");
    const original = btn.textContent;

    btn.disabled = true;
    btn.textContent = "Saving...";

    const payload = {
      full_name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      guests: guestsInput.value,
      date: dateInput.value,
      time: timeInput.value,
      notes: document.getElementById("requests").value.trim(),
    };

    try {
      const res = await fetch(BASE_URL + ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        showPopup("Reservation created successfully!", "success");
        form.reset();
        touched.clear();
        document.querySelectorAll(".error-container").forEach(e => e.style.display = "none");
      } else {
        showPopup(data.message || "Failed to create reservation.", "error");
      }
    } catch (err) {
      showPopup("Backend not responding.", "error");
    }

    btn.disabled = false;
    btn.textContent = original;
  }

  /* ------------------------------------------------------------
     POPUP NOTIFICATION
  ------------------------------------------------------------ */
  function showPopup(message, type) {
    const note = document.createElement("div");
    note.className = "notification";
    note.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === "success" ? "#4caf50" : "#e74c3c"};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      z-index: 99999;
      animation: fadeIn 0.3s;
    `;
    note.textContent = message;

    document.body.appendChild(note);
    setTimeout(() => note.remove(), 3000);
  }

  /* ------------------------------------------------------------
     INLINE ERROR FIELD STYLES
  ------------------------------------------------------------ */
  const style = document.createElement("style");
  style.textContent = `
    .error-field {
      border-color: #ff4444 !important;
      background-color: #fff8f8;
    }
    .error-container {
      margin-top: 4px;
      display: none;
    }
    .error-message {
      color: #ff4444;
      font-size: 0.9rem;
      animation: fadeIn 0.3s ease-in-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;
  document.head.appendChild(style);

});


