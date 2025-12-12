// ===============================
// reservation.js — Safe, Stable Version
// ===============================

document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("reservationForm");
  if (!form) return; // Safety Check

  // Auto-detect API base path (local or Apache /app prefix)
  const API_PREFIX = window.location.pathname.startsWith("/app")
      ? "/app"
      : "";

  const BASE_URL = API_PREFIX + "/api/reservations";

  const guestsInput = document.getElementById("guests");
  const dateInput = document.getElementById("date");
  const timeInput = document.getElementById("time");
  const guestWarning = document.querySelector(".guest-warning");

  // ------------------------------
  // LIMIT DATE + TIME
  // ------------------------------
  if (dateInput) {
    dateInput.min = new Date().toISOString().split("T")[0];
  }

  if (timeInput) {
    timeInput.min = "10:00";
    timeInput.max = "22:00";
  }

  // ------------------------------
  // ERROR CONTAINER SETUP
  // ------------------------------
  function initErrorContainers() {
    const fields = form.querySelectorAll("input, select, textarea");

    fields.forEach(field => {
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

  // ------------------------------
  // VALIDATION LOGIC
  // ------------------------------
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

  // Guests Warning
  if (guestsInput) {
    guestsInput.addEventListener("change", () => {
      let g = parseInt(guestsInput.value);
      if (guestWarning) guestWarning.style.display = g > 9 ? "block" : "none";

      if (touched.has("guests")) validateField(guestsInput);
    });
  }

  function validateField(field) {
    if (!field) return;

    const value = field.value.trim();
    let msg = "";

    let label = document.querySelector(`label[for="${field.id}"]`);
    let name = label ? label.textContent.replace("*", "").trim() : "This field";

    // Required Field
    if (field.required && !value) msg = `${name} is required`;

    // Email
    if (!msg && field.type === "email" && value !== "") {
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!valid.test(value)) {
        msg = "Please enter a valid email address";
      }
    }

    // Phone
    if (!msg && field.id === "phone" && value !== "") {
      const digits = value.replace(/\D/g, "");
      if (digits.length !== 10) msg = "Please enter a valid 10-digit phone number";
    }

    // Guests
    if (!msg && field.id === "guests" && value !== "") {
      const g = parseInt(value);
      if (g < 1 || g > 9) msg = "Guests must be between 1 and 9";
    }

    // Time
    if (!msg && field.id === "time" && value !== "") {
      if (value < "10:00" || value > "22:00") msg = "Time must be between 10:00–22:00";
    }

    // Name length
    if (!msg && field.id === "name" && value.length < 2) {
      msg = "Name must be at least 2 characters";
    }

    // Date
    if (!msg && field.id === "date" && value !== "") {
      const picked = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (picked < today) msg = "Date cannot be in the past";
    }

    showError(field, msg);
    return !msg;
  }

  // ------------------------------
  // ERROR DISPLAY
  // ------------------------------
  function showError(field, msg) {
    const box = field.nextElementSibling;
    if (!box) return;

    const text = box.querySelector(".error-message");

    if (msg) {
      field.classList.add("error-field");
      text.textContent = msg;
      box.style.display = "block";
    } else {
      field.classList.remove("error-field");
      text.textContent = "";
      box.style.display = "none";
    }
  }

  // ------------------------------
  // FORM SUBMIT VALIDATION
  // ------------------------------
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
      showPopup("Please fix all errors before submitting.", "error");
      const firstError = document.querySelector(".error-field");
      if (firstError) firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    await submitReservation();
  });

  // ------------------------------
  // SUBMIT TO BACKEND
  // ------------------------------
  async function submitReservation() {
    const btn = form.querySelector(".submit-btn");
    if (!btn) return;

    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Saving...";

    const payload = {
      full_name: document.getElementById("name")?.value.trim(),
      email: document.getElementById("email")?.value.trim(),
      phone: document.getElementById("phone")?.value.trim(),
      guests: guestsInput?.value,
      date: dateInput?.value,
      time: timeInput?.value,
      notes: document.getElementById("requests")?.value.trim(),
    };

    try {
      const res = await fetch(BASE_URL, {
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

  // ------------------------------
  // POPUP NOTIFICATION
  // ------------------------------
  function showPopup(msg, type) {
    const div = document.createElement("div");
    div.className = "notification";

    div.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 8px;
      font-weight: 600;
      color: white;
      background: ${type === "success" ? "#4CAF50" : "#E74C3C"};
      z-index: 9999;
      animation: fadeIn 0.3s ease;
    `;

    div.textContent = msg;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 3000);
  }

// ------------------------------
// VALIDATION LOGIC (same as contact.js)
// ------------------------------
function validateField(field) {
    const value = field.value.trim();
    const errorBox = field.nextElementSibling; // <div class="error-message"></div>
    let error = "";

    // Find the label text dynamically (supports data-i18n)
    let label = document.querySelector(`label[for="${field.id}"]`);
    let name = label ? label.textContent.replace("*", "").trim() : "This field";

    // Required check
    if (field.required && !value) {
        error = `${name} is required`;
    }

    // Name validation
    if (!error && field.id === "name" && value.length < 2) {
        error = "Name must be at least 2 characters";
    }

    // Email validation
    if (!error && field.type === "email") {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!pattern.test(value)) error = "Please enter a valid email address";
    }

    // Phone validation
    if (!error && field.id === "phone") {
        const digits = value.replace(/\D/g, "");
        if (digits.length !== 10) error = "Please enter a valid 10-digit phone number";
    }

    // Guests validation
    if (!error && field.id === "guests") {
        let g = parseInt(value);
        if (!g || g < 1 || g > 9) error = "Guests must be between 1 and 9";
    }

    // Date validation
    if (!error && field.id === "date") {
        const picked = new Date(value);
        const today = new Date();
        today.setHours(0,0,0,0);

        if (picked < today) error = "Date cannot be in the past";
    }

    // Time validation
    if (!error && field.id === "time") {
        if (value < "10:00" || value > "22:00") {
            error = "Time must be between 10:00–22:00";
        }
    }

    // Show / hide error
    if (error) {
        field.classList.add("error-field");
        errorBox.textContent = error;
        errorBox.style.display = "block";
        return false;
    } else {
        field.classList.remove("error-field");
        errorBox.textContent = "";
        errorBox.style.display = "none";
        return true;
    }
}


// ------------------------------
// REAL-TIME VALIDATION
// ------------------------------
form.querySelectorAll("input, select, textarea").forEach(field => {
    field.addEventListener("input", () => validateField(field));
    field.addEventListener("blur", () => validateField(field));

    if (field.tagName === "SELECT") {
        field.addEventListener("change", () => validateField(field));
    }
});

