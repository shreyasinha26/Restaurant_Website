// reservation.js

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const guestsSelect = document.getElementById("guests");
  const guestWarning = document.querySelector(".guest-warning");
  const dateInput = document.getElementById("date");
  const timeInput = document.getElementById("time");

  // 🔹 1. Hide warning initially
  guestWarning.style.display = "none";

  // 🔹 2. Restrict reservation date to today and future
  const today = new Date().toISOString().split("T")[0];
  dateInput.setAttribute("min", today);

  // 🔹 3. Warn if guest count > 9 (shouldn’t happen due to select options)
  guestsSelect.addEventListener("change", () => {
    const guestCount = parseInt(guestsSelect.value);
    if (guestCount > 9) {
      guestWarning.style.display = "block";
    } else {
      guestWarning.style.display = "none";
    }
  });

  // 🔹 4. Form submission handler
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

    // 🔹 Simple validation
    if (!name || !email || !phone || !guests || !date || !time) {
      alert("Please fill in all required fields.");
      return;
    }

    // 🔹 Confirm reservation
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
      "Confirm your reservation?\n\n" + confirmationMessage
    );

    if (confirmBooking) {
      // Simulate saving reservation
      alert("✅ Your table has been reserved successfully!");
      form.reset();
    } else {
      alert("Reservation canceled.");
    }
  });
});
