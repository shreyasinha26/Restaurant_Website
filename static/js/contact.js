// contact.js — Clean Real-time Validation + Backend Connected

document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm");
  if (!contactForm) return;

  /* ============================================================
     CONSTANTS
  ============================================================ */
  const BASE_URL = "http://127.0.0.1:5000";
  const ENDPOINT = "/contact";

  const locationSelect = document.getElementById("location");

  const locationInfo = {
    helsinki: {
      phone: "+358 40 123 4567",
    },
  };

  if (locationSelect) {
    locationSelect.addEventListener("change", function () {
      const phone = document.getElementById("phone");
      if (locationInfo[this.value]) {
        phone.value = locationInfo[this.value].phone;
      }
      validate(phone);
    });
  }

  /* ============================================================
     REAL-TIME VALIDATION
  ============================================================ */
  const requiredInputs = contactForm.querySelectorAll(
    "input[required], textarea[required], select[required]"
  );

  requiredInputs.forEach((field) => {
    field.addEventListener("blur", () => validate(field));
    field.addEventListener("input", () => validate(field));
    if (field.tagName === "SELECT") {
      field.addEventListener("change", () => validate(field));
    }
  });

  function validate(field) {
    const value = field.value.trim();
    let error = "";

    if (field.hasAttribute("required") && value === "") {
      error = "This field is required";
    }

    if (!error && field.type === "email" && value !== "") {
      const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailReg.test(value)) error = "Enter a valid email";
    }

    if (!error && field.type === "tel" && value !== "") {
      const phoneReg = /^[+]?[0-9\s\-()]+$/;
      if (!phoneReg.test(value)) error = "Enter a valid phone number";
    }

    return showError(field, error);
  }

  function validateForm() {
    let ok = true;
    requiredInputs.forEach((input) => {
      if (!validate(input)) ok = false;
    });
    return ok;
  }

  function showError(field, msg) {
    let err = field.parentNode.querySelector(".error-message");

    if (!err) {
      err = document.createElement("div");
      err.className = "error-message";
      field.parentNode.appendChild(err);
    }

    if (msg) {
      field.style.borderColor = "#ff4444";
      err.textContent = msg;
      err.style.display = "block";
      return false;
    }

    field.style.borderColor = "#ddd";
    err.style.display = "none";
    return true;
  }

  /* ============================================================
     SUBMIT HANDLER (Backend)
  ============================================================ */
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      notify("Fix errors before submitting.", "error");
      return;
    }

    await sendMessage();
  });

  async function sendMessage() {
    const submitBtn = contactForm.querySelector(".submit-btn");
    const originalText = submitBtn.textContent;

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    const payload = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      subject: document.getElementById("subject").value.trim(),
      message: document.getElementById("message").value.trim(),
    };

    try {
      const res = await fetch(BASE_URL + ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        notify(data.message || "Message failed.", "error");
      } else {
        notify("Message sent successfully! 🎉", "success");
        contactForm.reset();
      }
    } catch (err) {
      notify("Server offline. Please start backend.", "error");
    }

    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }

  /* ============================================================
     NOTIFICATION SYSTEM
  ============================================================ */
  function notify(message, type = "info") {
    const box = document.createElement("div");
    box.className = `notification ${type}`;
    box.innerHTML = `
      <span>${message}</span>
      <button>&times;</button>
    `;

    // CSS once
    if (!document.querySelector("#notif-style")) {
      const style = document.createElement("style");
      style.id = "notif-style";
      style.textContent = `
        .notification {
          position: fixed;
          top: 20px; right: 20px;
          background: #333; color: #fff;
          padding: 15px 20px;
          border-radius: 8px;
          display: flex; gap: 10px;
          animation: fadeIn .3s;
          z-index: 9999;
        }
        .notification.success { background: #4caf50; }
        .notification.error { background: #e74c3c; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(box);
    box.querySelector("button").onclick = () => box.remove();
    setTimeout(() => box.remove(), 5000);
  }
});
