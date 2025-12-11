// customer_dashboard.js - Complete Solution

document.addEventListener("DOMContentLoaded", function () {
    console.log("Dashboard JS loaded");
    initializeDashboard();
});

async function initializeDashboard() {
    try {
        const isAuthenticated = await checkAuthentication();
        
        if (isAuthenticated) {
            await loadUserData();
            setupNavigation();
            setupEventListeners();
        } else {
            window.location.href = '/app/customer_login';
        }
    } catch (error) {
        console.error("Dashboard initialization failed:", error);
        window.location.href = '/app/customer_login';
    }
}

async function checkAuthentication() {
    console.log("Checking authentication status...");
    
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        console.log("No authentication data found");
        return false;
    }
    
    try {
        // FIXED PATH: backend uses /api/current-user
        const response = await fetch('/api/current-user', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        
        if (response.ok) {
            return true;
        } else {
            clearAuthData();
            return false;
        }
    } catch (error) {
        console.error("Auth check error:", error);
        clearAuthData();
        return false;
    }
}

async function loadUserData() {
    try {
        const userData = localStorage.getItem('user');
        
        if (userData) {
            const user = JSON.parse(userData);
            updateWelcomeMessage(user.name);
        }
    } catch (error) {
        console.error("Error loading user data:", error);
    }
}

function updateWelcomeMessage(userName) {
    const welcomeHeading = document.querySelector('.welcome-section h1');
    const welcomeSubtitle = document.querySelector('.welcome-section p');
    
    if (welcomeHeading && userName) {
        welcomeHeading.textContent = `Welcome, ${userName}! 👋`;
    }
    
    if (welcomeSubtitle && userName) {
        welcomeSubtitle.textContent = `Ready to explore FreshBite Kitchen, ${userName}?`;
    }
}

function setupNavigation() {
    const actionCards = document.querySelectorAll('.action-card');
    
    actionCards.forEach(card => {
        card.addEventListener('click', function() {
            handleNavigation(this);
        });
        
        card.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleNavigation(this);
            }
        });
        
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
    });
}

function setupEventListeners() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

function handleNavigation(card) {
    const text = card.querySelector('h3').textContent.trim();

    const routes = {
        'View Menu': () => window.location.href = '/app/menu',
        'Make Reservation': () => window.location.href = '/app/reservation',
        'My Orders': () => window.location.href = '/app/menu',
        'My Reservations': () => window.location.href = '/app/reservation'
    };

    if (routes[text]) routes[text]();
}

async function logout() {
    console.log("Logout initiated");
    
    if (confirm('Are you sure you want to logout?')) {
        try {
            // FIXED: Backend path
            const response = await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include'
            });
            
            if (response.ok) {
                showLogoutMessage();
                setTimeout(() => {
                    clearAuthData();
                    window.location.href = '/app/';
                }, 1000);
            } else {
                throw new Error('Logout failed');
            }
        } catch (error) {
            console.error("Logout error:", error);
            clearAuthData();
            window.location.href = '/app/';
        }
    }
}

function showLogoutMessage() {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = 'Logout successful! Redirecting...';
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 1000;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => messageDiv.remove(), 2000);
}

function clearAuthData() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
}

window.logout = logout;
