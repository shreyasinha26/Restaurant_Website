// ============================
// CONTACT FORM VALIDATION + SEND
// ============================

document.addEventListener("DOMContentLoaded", () => {
    const contactForm = document.getElementById("contactForm");
    if (!contactForm) return;

    const BASE_URL = "http://127.0.0.1:5000/contact";

    // -----------------------------
    // CREATE ERROR MESSAGE BOXES
    // -----------------------------
    function prepareErrorBoxes() {
        const groups = contactForm.querySelectorAll(".form-group");
        groups.forEach(group => {
            if (!group.querySelector(".error-message")) {
                const div = document.createElement("div");
                div.className = "error-message";
                group.appendChild(div);
            }
        });
    }

    prepareErrorBoxes();

    // -----------------------------
    // VALIDATION LOGIC
    // -----------------------------
    function validateField(field) {
        const value = field.value.trim();
        const errorBox = field.closest(".form-group").querySelector(".error-message");
        let error = "";

        // Name required & min length
        if (field.id === "name") {
            if (value.length < 2) error = "Name must be at least 2 characters.";
        }

        // Email required + format
        if (field.id === "email") {
            if (value === "") error = "Email is required.";
            else {
                const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailReg.test(value)) error = "Enter a valid email address.";
            }
        }

        // Phone must be exactly 10 digits
        if (field.id === "phone") {
            const digits = value.replace(/\D/g, "");
            if (digits.length !== 10) {
                error = "Phone number must be exactly 10 digits.";
            }
        }

        // Subject required
        if (field.id === "subject" && value === "") {
            error = "Subject is required.";
        }

        // Message required + min length
        if (field.id === "message") {
            if (value.length < 10) error = "Message must be at least 10 characters.";
        }

        // Apply error or clear
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

    // Validate on input
    contactForm.querySelectorAll("input, textarea").forEach(field => {
        field.addEventListener("input", () => validateField(field));
    });

    // Validate all fields before submit
    function validateForm() {
        let valid = true;
        contactForm.querySelectorAll("input, textarea").forEach(field => {
            if (!validateField(field)) valid = false;
        });
        return valid;
    }

    // -----------------------------
    // SUBMIT HANDLER
    // -----------------------------
    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showNotification("Please fix the errors before submitting.", "error");
            return;
        }

        const payload = {
            name: document.getElementById("name").value.trim(),
            email: document.getElementById("email").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            subject: document.getElementById("subject").value.trim(),
            message: document.getElementById("message").value.trim(),
        };

        try {
            const res = await fetch(BASE_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                showNotification(data.message || "Message could not be sent.", "error");
                return;
            }

            showNotification("Message sent successfully! 🎉", "success");
            contactForm.reset();
            document.querySelectorAll(".error-message").forEach(e => e.style.display = "none");
            document.querySelectorAll(".error-field").forEach(f => f.classList.remove("error-field"));

        } catch (error) {
            showNotification("Server is offline. Please start the backend.", "error");
        }
    });

    // -----------------------------
    // NOTIFICATIONS
    // -----------------------------
    function showNotification(msg, type) {
        const note = document.createElement("div");
        note.textContent = msg;

        note.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 14px 18px;
            color: white;
            font-weight: 600;
            border-radius: 8px;
            z-index: 9999;
            background: ${type === "success" ? "#4CAF50" : "#E74C3C"};
            box-shadow: 0 3px 8px rgba(0,0,0,0.2);
            animation: fadeIn 0.3s ease;
        `;

        document.body.appendChild(note);
        setTimeout(() => note.remove(), 3000);
    }
});

