// ---------- reservation.js (Enhanced) ----------

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const guestsSelect = document.getElementById("guests");
  const guestWarning = document.querySelector(".guest-warning");
  const dateInput = document.getElementById("date");
  const timeInput = document.getElementById("time");
  const submitBtn = form.querySelector("button[type='submit']");

  // 🔹 1. Hide guest warning initially
  if (guestWarning) guestWarning.style.display = "none";

  // 🔹 2. Restrict reservation date (today and future)
  const today = new Date().toISOString().split("T")[0];
  dateInput.setAttribute("min", today);

  // 🔹 3. Restrict time selection (restaurant hours)
  timeInput.setAttribute("min", "10:00");
  timeInput.setAttribute("max", "22:00");

  // 🔹 4. Warn if guest count > 9
  guestsSelect.addEventListener("change", () => {
    const guestCount = parseInt(guestsSelect.value);
    guestWarning.style.display = guestCount > 9 ? "block" : "none";
  });

  // 🔹 5. Form submission
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    // Collect form data
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const guests = guestsSelect.value;
    const date = dateInput.value;
    const time = timeInput.value;
    const requests = document.getElementById("requests").value.trim();

    // ---------- VALIDATION ----------
    const errors = [];

    // Name validation
    if (!name) errors.push("Full name is required.");

    // Email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email)) {
      errors.push("A valid email address is required.");
    }

    // Phone validation — 10 digits only
    const phonePattern = /^\d{10}$/;
    if (!phone || !phonePattern.test(phone)) {
      errors.push("Phone number must be 10 digits.");
    }

    // Other fields
    if (!guests) errors.push("Please select the number of guests.");
    if (!date) errors.push("Please choose a reservation date.");
    if (!time) errors.push("Please select a time between 10:00–22:00.");

    // If validation fails
    if (errors.length > 0) {
      alert("⚠️ Please fix the following:\n\n" + errors.join("\n"));
      return;
    }

    // ---------- CONFIRMATION ----------
    const confirmationMessage = `
Reservation Details:
-------------------------
Name: ${name}
Email: ${email}
Phone: ${phone}
Guests: ${guests}
Date: ${date}
Time: ${time}
Special Requests: ${requests || "None"}
    `;

    const confirmBooking = confirm(
      "Please confirm your reservation:\n\n" + confirmationMessage
    );

    if (confirmBooking) {
      alert("✅ Your table has been reserved successfully!");
      form.reset();
    } else {
      alert("❌ Reservation canceled.");
    }
  });
});

