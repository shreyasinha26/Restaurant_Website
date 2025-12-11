// ==========================================
// signup.js — Safe, Production-Ready Version
// ==========================================

// Get form safely
const signupForm = document.getElementById("customerSignupForm");
if (!signupForm) {
    console.warn("Signup form not found");
}

// Auto-detect API prefix (local vs Apache /app/)
const API_PREFIX = window.location.pathname.startsWith("/app") ? "/app" : "";
const SIGNUP_URL = `${API_PREFIX}/api/signup`;

// --------------------------
// VALIDATION HELPERS
// --------------------------
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^[0-9]{10}$/.test(phone);
}

// --------------------------
// ERROR HANDLING
// --------------------------
function showError(input, message) {
    if (!input) return;

    let errorElem = input.nextElementSibling;
    if (!errorElem || !errorElem.classList.contains("error-msg")) {
        errorElem = document.createElement("div");
        errorElem.className = "error-msg";
        Object.assign(errorElem.style, {
            color: "#ff4d4d",
            fontSize: "0.8rem",
            marginTop: "5px"
        });
        input.parentNode.appendChild(errorElem);
    }

    errorElem.textContent = message;
    input.style.borderColor = "#ff4d4d";
}

function clearError(input) {
    if (!input) return;

    let errorElem = input.nextElementSibling;
    if (errorElem && errorElem.classList.contains("error-msg")) {
        errorElem.textContent = "";
    }
    input.style.borderColor = "#ddd";
}

// --------------------------
// GENERAL MESSAGES
// --------------------------
function showMessage(message, isError = false) {
    const existing = document.querySelector(".form-message");
    if (existing) existing.remove();

    const div = document.createElement("div");
    div.className = `form-message ${isError ? "error" : "success"}`;
    div.textContent = message;

    Object.assign(div.style, {
        padding: "10px",
        borderRadius: "8px",
        marginBottom: "15px",
        textAlign: "center",
        fontWeight: "600",
        backgroundColor: isError ? "#ffebee" : "#e8f5e8",
        color: isError ? "#c62828" : "#2e7d32",
        border: isError ? "1px solid #ffcdd2" : "1px solid #c8e6c9"
    });

    signupForm.insertBefore(div, signupForm.firstChild);
}

// --------------------------
// LOADING STATE
// --------------------------
function setLoading(button, isLoading) {
    if (!button) return;

    if (isLoading) {
        button.disabled = true;
        button.textContent = "Creating Account...";
        button.style.opacity = "0.7";
    } else {
        button.disabled = false;
        button.textContent = "Create Account";
        button.style.opacity = "1";
    }
}

// --------------------------
// FORM SUBMISSION
// --------------------------
if (signupForm) {
    signupForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const name = document.getElementById("name");
        const email = document.getElementById("email");
        const phone = document.getElementById("phone");
        const address = document.getElementById("address");
        const password = document.getElementById("password");
        const confirmPassword = document.getElementById("confirmPassword");
        const button = signupForm.querySelector('button[type="submit"]');

        let valid = true;

        // --------------------------
        // FIELD VALIDATION
        // --------------------------
        if (!name.value.trim()) {
            showError(name, "Full name is required.");
            valid = false;
        } else clearError(name);

        if (!email.value.trim()) {
            showError(email, "Email is required.");
            valid = false;
        } else if (!isValidEmail(email.value.trim())) {
            showError(email, "Please enter a valid email.");
            valid = false;
        } else clearError(email);

        if (!phone.value.trim()) {
            showError(phone, "Phone number is required.");
            valid = false;
        } else if (!isValidPhone(phone.value.trim())) {
            showError(phone, "Please enter a valid 10-digit phone number.");
            valid = false;
        } else clearError(phone);

        if (!address.value.trim()) {
            showError(address, "Delivery address is required.");
            valid = false;
        } else clearError(address);

        if (!password.value.trim()) {
            showError(password, "Password is required.");
            valid = false;
        } else if (password.value.length < 6) {
            showError(password, "Password must be at least 6 characters.");
            valid = false;
        } else clearError(password);

        if (!confirmPassword.value.trim()) {
            showError(confirmPassword, "Please confirm your password.");
            valid = false;
        } else if (confirmPassword.value !== password.value) {
            showError(confirmPassword, "Passwords do not match.");
            valid = false;
        } else clearError(confirmPassword);

        if (!valid) return;

        // --------------------------
        // SEND REQUEST
        // --------------------------
        setLoading(button, true);

        try {
            const payload = {
                name: name.value.trim(),
                email: email.value.trim(),
                phone: phone.value.trim(),
                address: address.value.trim(),
                password: password.value,
                confirmPassword: confirmPassword.value
            };

            const response = await fetch(SIGNUP_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                showMessage("Account created successfully! Redirecting...", false);
                signupForm.reset();

                setTimeout(() => {
                    window.location.href = `${API_PREFIX}/customer_login`;
                }, 1500);

            } else {
                showMessage(data.error || "Signup failed!", true);
            }

        } catch (err) {
            console.error("Signup error:", err);
            showMessage("Server error. Please try again later.", true);
        }

        setLoading(button, false);
    });
}

// --------------------------
// REAL-TIME VALIDATION
// --------------------------
const realtimeFields = [
    { id: "name", validator: v => v.trim() !== "", msg: "Full name is required." },
    { id: "email", validator: isValidEmail, msg: "Please enter a valid email." },
    { id: "phone", validator: isValidPhone, msg: "Please enter a valid 10-digit phone number." },
    { id: "address", validator: v => v.trim() !== "", msg: "Address is required." },
    { id: "password", validator: v => v.length >= 6, msg: "Password must be at least 6 characters." }
];

realtimeFields.forEach(item => {
    const field = document.getElementById(item.id);
    if (field) {
        field.addEventListener("input", function () {
            if (!item.validator(this.value.trim())) {
                showError(this, item.msg);
            } else clearError(this);
        });
    }
});

// Confirm password checker
const confirmPass = document.getElementById("confirmPassword");
if (confirmPass) {
    confirmPass.addEventListener("input", function () {
        const pass = document.getElementById("password")?.value;
        if (this.value !== pass) {
            showError(this, "Passwords do not match.");
        } else clearError(this);
    });
}
