document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("loginForm");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    // ------------------------------
    // Helper: Show Notification
    // ------------------------------
    function showNotification(message, type = "error") {
        const existing = document.querySelector(".login-notification");
        if (existing) existing.remove();

        const box = document.createElement("div");
        box.className = `login-notification ${type}`;
        box.textContent = message;

        document.body.appendChild(box);

        setTimeout(() => box.remove(), 3000);
    }

    // Add notification styles
    if (!document.getElementById("login-notification-style")) {
        const style = document.createElement("style");
        style.id = "login-notification-style";

        style.textContent = `
            .login-notification {
                position: fixed;
                top: 90px;
                right: 20px;
                background: #ff4d4d;
                color: #fff;
                padding: 12px 18px;
                border-radius: 6px;
                font-weight: 600;
                z-index: 9999;
                animation: fadeIn 0.3s ease;
            }
            .login-notification.success {
                background: #4CAF50;
            }
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }

    // ------------------------------
    // Email Validator
    // ------------------------------
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // ------------------------------
    // Submit Handler - UPDATED FOR JWT
    // ------------------------------
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        // ------------ FRONTEND VALIDATION ------------
        if (!email) {
            showNotification("Email is required");
            return;
        }
        if (!isValidEmail(email)) {
            showNotification("Please enter a valid email");
            return;
        }
        if (!password) {
            showNotification("Password is required");
            return;
        }

        // Show loading state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Logging in...";
        submitBtn.disabled = true;

        // ------------ SEND REQUEST TO BACKEND ------------
        try {
            const response = await fetch("http://127.0.0.1:5000/admin/login", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (!response.ok) {
                showNotification(result.message || "Login failed");
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                return;
            }

            // ------------ SUCCESS: SAVE TOKEN & ADMIN INFO ------------
            showNotification("Login successful", "success");

            // Save both token and admin info
            localStorage.setItem("adminToken", result.token);
            localStorage.setItem("admin", JSON.stringify(result.admin));

            console.log("Token saved:", result.token); // For debugging

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = "admin-dashboard.html";
            }, 800);

        } catch (error) {
            console.error("Login error:", error);
            showNotification("Server not responding. Start your backend!");
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

});
