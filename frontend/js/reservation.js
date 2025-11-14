// ---------- reservation.js (FINAL CLEAN VERSION) ----------

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const guestsSelect = document.getElementById("guests");
  const guestWarning = document.querySelector(".guest-warning");
  const dateInput = document.getElementById("date");
  const timeInput = document.getElementById("time");

  // Hide guest warning initially
  guestWarning.style.display = "none";

  // Restrict date to today + future
  const today = new Date().toISOString().split("T")[0];
  dateInput.min = today;

  // Restrict time to restaurant hours
  timeInput.min = "10:00";
  timeInput.max = "22:00";

  // Show guest warning if > 9 (not allowed)
  guestsSelect.addEventListener("change", () => {
    const guestCount = parseInt(guestsSelect.value);
    guestWarning.style.display = guestCount > 9 ? "block" : "none";
  });

  // ---------- SUBMIT FORM ----------
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Gather reservation data
    const reservationData = {
      full_name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      guests: document.getElementById("guests").value,
      date: document.getElementById("date").value,
      time: document.getElementById("time").value,
      notes: document.getElementById("requests").value.trim(),
    };

    // ---------- SEND TO BACKEND ----------
    try {
      const response = await fetch("http://127.0.0.1:5000/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservationData),
      });

      const result = await response.json();

      if (!response.ok) {
        alert("❌ Please fix the following:\n\n" + result.errors.join("\n"));
        return;
      }

      // Successful reservation
      alert("✅ Reservation confirmed!\nReservation ID: " + result.reservation_id);
      form.reset();

    } catch (error) {
      alert("⚠ Server not responding. Please start Flask backend.");
    }
  });
});

