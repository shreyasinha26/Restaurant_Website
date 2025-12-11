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
            window.location.href = '/customer_login';
        }
    } catch (error) {
        console.error("Dashboard initialization failed:", error);
        window.location.href = '/customer_login';
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
        // 🔥 FIXED PATH FOR METROPOLIA SERVER
        const response = await fetch('/app/api/current-user', {
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

    if (window.innerWidth <= 768) {
        addMobileMenuToggle();
    }

    window.addEventListener('resize', function() {
        if (window.innerWidth <= 768) {
            addMobileMenuToggle();
        } else {
            removeMobileMenuToggle();
        }
    });
}

function handleNavigation(card) {
    const cardText = card.querySelector('h3').textContent.trim();
    
    const navigationMap = {
        'View Menu': () => { window.location.href = '/menu'; },
        'Make Reservation': () => { window.location.href = '/reservation'; },
        'My Orders': () => { window.location.href = '/menu'; },
        'My Reservations': () => { window.location.href = '/reservation'; }
    };
    
    if (navigationMap[cardText]) {
        navigationMap[cardText]();
    }
}

function addMobileMenuToggle() {
    const navRight = document.querySelector('.nav-right');
    if (!navRight) return;
    
    if (document.querySelector('.mobile-menu-toggle')) return;
    
    const menuToggle = document.createElement('button');
    menuToggle.className = 'mobile-menu-toggle';
    menuToggle.innerHTML = '☰';
    menuToggle.setAttribute('aria-label', 'Toggle menu');
    menuToggle.setAttribute('aria-expanded', 'false');
    
    navRight.appendChild(menuToggle);
    
    menuToggle.addEventListener('click', function() {
        const navList = navRight.querySelector('ul');
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        
        if (navList) {
            navList.classList.toggle('show');
            menuToggle.setAttribute('aria-expanded', (!isExpanded).toString());
        }
    });
}

function removeMobileMenuToggle() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navList = document.querySelector('.nav-right ul');
    
    if (menuToggle) menuToggle.remove();
    if (navList) navList.classList.remove('show');
}

async function logout() {
    console.log("Logout initiated");
    
    if (confirm('Are you sure you want to logout?')) {
        try {
            // 🔥 PATH FOR METROPOLIA SERVER
            const response = await fetch('/app/api/logout', {
                method: 'POST',
                credentials: 'include'
            });
            
            if (response.ok) {
                showLogoutMessage();
                setTimeout(() => {
                    clearAuthData();
                    window.location.href = '/';
                }, 1000);
            } else {
                throw new Error('Logout failed');
            }
        } catch (error) {
            console.error("Logout error:", error);
            clearAuthData();
            window.location.href = '/';
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
    
    setTimeout(() => {
        messageDiv.remove();
    }, 2000);
}

function clearAuthData() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
}

window.logout = logout;
