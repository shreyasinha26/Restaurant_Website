_// customer_dashboard.js

document.addEventListener("DOMContentLoaded", function () {
    console.log("Dashboard JS loaded");
    checkAuthentication();
    setupNavigation();
});

function checkAuthentication() {
    // For demo purposes, set login status if not exists
    if (!localStorage.getItem('isLoggedIn')) {
        localStorage.setItem('isLoggedIn', 'true');
    }
    
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    console.log("Login status:", isLoggedIn);
    
    if (isLoggedIn !== 'true') {
        window.location.href = 'login.html';
        return false;
    }
    return true;
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
    });
    
    // Add mobile menu toggle for small screens
    if (window.innerWidth <= 768) {
        addMobileMenuToggle();
    }
}

function handleNavigation(card) {
    const cardText = card.querySelector('h3').textContent;
    console.log("Navigating to:", cardText);
    
    // Add click animation
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
        card.style.transform = '';
    }, 150);
    
    // Navigate based on card type
    switch(cardText) {
        case 'View Menu':
            navigateToMenu();
            break;
        case 'Make Reservation':
            navigateToReservation();
            break;
        case 'My Orders':
            navigateToOrders();
            break;
        case 'My Reservations':
            navigateToMyReservations();
            break;
        default:
            console.log("Unknown navigation target:", cardText);
    }
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
    window.location.href = 'orders.html';
}

function navigateToMyReservations() {
    console.log("Redirecting to my reservations page");
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
    
    navRight.appendChild(menuToggle);
    
    menuToggle.addEventListener('click', function() {
        const navList = navRight.querySelector('ul');
        if (navList) {
            navList.classList.toggle('show');
            console.log("Mobile menu toggled");
        }
    });
    
    console.log("Mobile menu toggle added");
}

function logout() {
    console.log("Logout initiated");
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('isLoggedIn');
        console.log("User logged out");
        window.location.href = 'home.html';
    }
}

// Make functions available globally
window.logout = logout;
window.navigateToMenu = navigateToMenu;
window.navigateToReservation = navigateToReservation;
window.navigateToOrders = navigateToOrders;
window.navigateToMyReservations = navigateToMyReservations;

console.log("Dashboard JS initialized");