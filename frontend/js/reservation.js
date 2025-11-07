// ---------- reservation.js (Final Enhanced Version) ----------

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const guestsSelect = document.getElementById("guests");
  const guestWarning = document.querySelector(".guest-warning");
  const dateInput = document.getElementById("date");
  const timeInput = document.getElementById("time");

  // Hide guest warning initially
  if (guestWarning) guestWarning.style.display = "none";

  // Restrict date (today and future)
  const today = new Date().toISOString().split("T")[0];
  dateInput.min = today;

  // Restaurant opening hours
  timeInput.min = "10:00";
  timeInput.max = "22:00";

  // Show guest warning above 9
  guestsSelect.addEventListener("change", () => {
    const guestCount = parseInt(guestsSelect.value);
    guestWarning.style.display = guestCount > 9 ? "block" : "none";
  });

  // Handle form submission
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const guests = guestsSelect.value;
    const date = dateInput.value;
    const time = timeInput.value;
    const requests = document.getElementById("requests").value.trim();

    // Collect validation errors
    const errors = [];

    // Name
    if (!name) errors.push("Full name is required.");

    // Email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailPattern.test(email)) {
      errors.push("Please enter a valid email address.");
    }

    // Phone (allow spaces but must be 10 digits total)
    const numericPhone = phone.replace(/\D/g, "");
    if (numericPhone.length !== 10) {
      errors.push("Phone number must be exactly 10 digits.");
    }

    // Guests
    if (!guests) errors.push("Please select number of guests.");

    // Date
    if (!date) errors.push("Please choose a reservation date.");

    // Time
    if (!time) {
      errors.push("Please select a reservation time.");
    } else if (time < "10:00" || time > "22:00") {
      errors.push("Reservations are available between 10:00 and 22:00.");
    }

    // Show errors
    if (errors.length > 0) {
      alert("Please fix the following:\n\n" + errors.join("\n"));
      return;
    }

    // Confirmation message
    const confirmText =
      "Please confirm your reservation:\n\n" +
      "Name: " + name + "\n" +
      "Email: " + email + "\n" +
      "Phone: " + phone + "\n" +
      "Guests: " + guests + "\n" +
      "Date: " + date + "\n" +
      "Time: " + time + "\n" +
      "Special Requests: " + (requests || "None");

    const confirmBooking = confirm(confirmText);

    if (confirmBooking) {
      alert("✅ Your table has been reserved successfully!");
      form.reset();
    } else {
      alert("Reservation canceled.");
    }
  });
});
