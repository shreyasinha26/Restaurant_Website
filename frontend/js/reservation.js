// ---------- reservation.js (FINAL VERSION with Notifications) ----------

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const guestsSelect = document.getElementById("guests");
  const guestWarning = document.querySelector(".guest-warning");
  const dateInput = document.getElementById("date");
  const timeInput = document.getElementById("time");

  // Hide guest warning initially
  if (guestWarning) guestWarning.style.display = "none";

  // Restrict date to today + future
  const today = new Date().toISOString().split("T")[0];
  dateInput.min = today;

  // Restrict time to business hours
  timeInput.min = "10:00";
  timeInput.max = "22:00";

  // Show guest warning if > 9
  guestsSelect.addEventListener("change", () => {
    const guestCount = parseInt(guestsSelect.value);
    guestWarning.style.display = guestCount > 9 ? "block" : "none";
  });

  // ---------- SUBMIT FORM ----------
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // collect form data
    const reservationData = {
      full_name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      guests: document.getElementById("guests").value,
      date: document.getElementById("date").value,
      time: document.getElementById("time").value,
      notes: document.getElementById("requests").value.trim(),
    };

    try {
      const response = await fetch("http://127.0.0.1:5000/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservationData),
      });

      const result = await response.json();

      if (!response.ok) {
        showNotification("❌ Please fix the following:<br>" + result.errors.join("<br>"), "error");
        return;
      }

      // SUCCESS POPUP
      showNotification("🎉 Reservation confirmed!<br>ID: " + result.reservation_id, "success");
      form.reset();

    } catch (error) {
      showNotification("⚠ Server not responding. Please start Flask backend.", "error");
    }
  });

  // ---------- NOTIFICATION SYSTEM ----------
  function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <span class="notification-message">${message}</span>
      <button class="notification-close">&times;</button>
    `;

    // Add notification styles once
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
          z-index: 10000;
          display: flex;
          align-items: center;
          gap: 10px;
          max-width: 350px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.25);
          animation: slideIn 0.3s ease-out;
        }
        .notification.success { background: #4CAF50; }
        .notification.error { background: #ff4444; }
        .notification.info { background: #2196F3; }

        .notification-close {
          background: none;
          border: none;
          font-size: 18px;
          color: #fff;
          cursor: pointer;
        }

        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    // Auto hide
    setTimeout(() => {
      if (notification.parentNode) notification.remove();
    }, 5000);

    notification.querySelector(".notification-close").onclick = () => notification.remove();
  }
});



