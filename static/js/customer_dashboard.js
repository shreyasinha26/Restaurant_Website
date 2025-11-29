// customer_dashboard.js - Complete Solution

document.addEventListener("DOMContentLoaded", function () {
    console.log("Dashboard JS loaded");
    initializeDashboard();
});

async function initializeDashboard() {
    try {
        // First check authentication
        const isAuthenticated = await checkAuthentication();
        
        if (isAuthenticated) {
            // Load user data and setup UI
            await loadUserData();
            setupNavigation();
            setupEventListeners();
        } else {
            // Redirect to login if not authenticated
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
    
    console.log("Token exists:", !!token);
    console.log("User data exists:", !!user);
    
    if (!token || !user) {
        console.log("No authentication data found");
        return false;
    }
    
    try {
        // Verify token with server
        const response = await fetch('/api/current-user', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            credentials: 'include'
        });
        
        if (response.ok) {
            console.log("User is authenticated");
            return true;
        } else {
            console.log("Token validation failed");
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
            console.log("Loaded user data:", user);
            
            // Update welcome message with user's name
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
    console.log("Setting up navigation");
    
    // Add click handlers for action cards
    const actionCards = document.querySelectorAll('.action-card');
    console.log("Found action cards:", actionCards.length);
    
    actionCards.forEach(card => {
        card.addEventListener('click', function() {
            console.log("Card clicked:", this.querySelector('h3').textContent);
            handleNavigation(this);
        });
        
        // Add keyboard accessibility
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
    // Setup logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Add mobile menu toggle for small screens
    if (window.innerWidth <= 768) {
        addMobileMenuToggle();
    }
    
    // Handle window resize for mobile menu
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
    console.log("Navigating to:", cardText);
    
    // Add click animation
    animateCardClick(card);
    
    // Navigate based on card type
    const navigationMap = {
        'View Menu': navigateToMenu,
        'Make Reservation': navigateToReservation,
        'My Orders': navigateToOrders,
        'My Reservations': navigateToMyReservations
    };
    
    const navigateFunction = navigationMap[cardText];
    if (navigateFunction) {
        navigateFunction();
    } else {
        console.log("Unknown navigation target:", cardText);
    }
}

function animateCardClick(card) {
    card.style.transform = 'scale(0.95)';
    card.style.transition = 'transform 0.15s ease';
    
    setTimeout(() => {
        card.style.transform = '';
    }, 150);
}

function navigateToMenu() {
    console.log("Redirecting to menu page");
    window.location.href = 'menu.html';
}

function navigateToReservation() {
    console.log("Redirecting to reservation page");
    window.location.href = 'reservation.html';
}

function navigateToOrders() {
    console.log("Redirecting to orders page");
    // For now, redirect to menu as placeholder
    // Replace with actual orders page when available
    window.location.href = 'menu.html';
}

function navigateToMyReservations() {
    console.log("Redirecting to my reservations page");
    // For now, redirect to reservation as placeholder
    // Replace with actual reservations page when available
    window.location.href = 'reservation.html';
}

function addMobileMenuToggle() {
    console.log("Adding mobile menu toggle");
    
    const navRight = document.querySelector('.nav-right');
    if (!navRight) {
        console.log("Nav-right not found");
        return;
    }
    
    // Check if toggle already exists
    if (document.querySelector('.mobile-menu-toggle')) {
        return;
    }
    
    const menuToggle = document.createElement('button');
    menuToggle.className = 'mobile-menu-toggle';
    menuToggle.innerHTML = '☰';
    menuToggle.setAttribute('aria-label', 'Toggle menu');
    menuToggle.setAttribute('aria-expanded', 'false');
    
    // Style the toggle button
    Object.assign(menuToggle.style, {
        background: 'none',
        border: 'none',
        color: '#f1f1f1',
        fontSize: '1.5rem',
        cursor: 'pointer',
        padding: '5px 10px',
        borderRadius: '4px'
    });
    
    navRight.appendChild(menuToggle);
    
    menuToggle.addEventListener('click', function() {
        const navList = navRight.querySelector('ul');
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        
        if (navList) {
            navList.classList.toggle('show');
            menuToggle.setAttribute('aria-expanded', (!isExpanded).toString());
            console.log("Mobile menu toggled");
        }
    });
}

function removeMobileMenuToggle() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navList = document.querySelector('.nav-right ul');
    
    if (menuToggle) {
        menuToggle.remove();
    }
    
    if (navList) {
        navList.classList.remove('show');
    }
}

async function logout() {
    console.log("Logout initiated");
    
    if (confirm('Are you sure you want to logout?')) {
        try {
            // Show loading state
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.textContent = 'Logging out...';
                logoutBtn.style.opacity = '0.7';
            }
            
            // Call logout API to clear server-side cookie
            const response = await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include'
            });
            
            console.log("Logout API response:", response.status);
            
            if (response.ok) {
                console.log("Logout successful");
                showLogoutMessage();
                
                // Clear client-side storage and redirect after a brief delay
                setTimeout(() => {
                    clearAuthData();
                    window.location.href = '/';
                }, 1000);
                
            } else {
                throw new Error('Logout API call failed');
            }
            
        } catch (error) {
            console.error("Logout error:", error);
            // Still clear storage and redirect even if API call fails
            clearAuthData();
            window.location.href = '/';
        }
    }
}

function showLogoutMessage() {
    // Create a temporary logout success message
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
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(messageDiv);
    
    // Remove message after 2 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 2000);
}

function clearAuthData() {
    // Clear all authentication-related data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn'); // Remove old flag if exists
    
    console.log("Authentication data cleared");
}

// Make logout function available globally for onclick attribute
window.logout = logout;

console.log("Dashboard JS initialized");