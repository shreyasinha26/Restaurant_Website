// API base URL
const API_BASE = '/app/api';

// Function to show loading state
function showLoading(element) {
    element.innerHTML = '<div class="loading">Loading menu items...</div>';
}

// Function to show error state
function showError(element, message) {
    element.innerHTML = `<div class="error-message">${message}</div>`;
}


// Function to fetch and display today's menu
async function loadTodaysMenu() {
    try {
        const todaySpecialSection = document.querySelector('.special-items');
        if (!todaySpecialSection) {
            console.log('No special-items section found');
            return;
        }
        
        showLoading(todaySpecialSection);
        
        const response = await fetch(`${API_BASE}/menu/today`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const menuItems = await response.json();
        console.log('Today\'s specials loaded:', menuItems);
        
        if (menuItems.length > 0) {
            todaySpecialSection.innerHTML = menuItems.map(item => `
                <div class="special-item">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='/static/images/default.jpg'">
                    <div class="special-info">
                        <h3>${item.name}</h3>
                        <p>${item.description}</p>
                        ${item.dietary && item.dietary.length > 0 ? 
                            `<div class="dietary-tags">${item.dietary.map(tag => 
                                `<span class="dietary-tag">${tag}</span>`
                            ).join('')}</div>` : ''}
                        <span class="price">€${item.price.toFixed(2)}</span>
                        <button class="add-cart-btn" data-item='${JSON.stringify(item).replace(/'/g, "&#39;")}'>Add to Cart</button>
                    </div>
                </div>
            `).join('');
            
            // Re-attach cart event listeners
            attachCartEventListeners();
        } else {
            todaySpecialSection.innerHTML = '<div class="no-items">No specials today. Check back tomorrow!</div>';
        }
    } catch (error) {
        console.error('Error loading today\'s menu:', error);
        const todaySpecialSection = document.querySelector('.special-items');
        if (todaySpecialSection) {
            showError(todaySpecialSection, 'Failed to load today\'s specials. Please try again later.');
        }
    }
}

// Function to display menu items in the container
function displayMenuItems(menuItems, container) {
    if (menuItems.length > 0) {
        container.innerHTML = menuItems.map(item => `
            <div class="menu-item">
                <div class="item-image">
                    <img src="${item.image}" alt="${item.name}" 
                         onerror="console.error('Failed to load image:', this.src); this.style.display='none'">
                </div>
                <div class="item-info">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                    ${item.dietary && item.dietary.length > 0 ? 
                        `<div class="dietary-tags">${item.dietary.map(tag => 
                            `<span class="dietary-tag">${tag}</span>`
                        ).join('')}</div>` : ''}
                    <div class="price">€${item.price.toFixed(2)}</div>
                    <button class="add-cart-btn" data-item='${JSON.stringify(item).replace(/'/g, "&#39;")}'>Add to Cart</button>
                </div>
            </div>
        `).join('');
        
        attachCartEventListeners();
    } else {
        container.innerHTML = '<p class="no-items">No items found in this category.</p>';
    }
}

// Function to load all menu items
async function loadAllMenuItems() {
    try {
        const menuContainer = document.getElementById('menu-items-container');
        if (!menuContainer) return;
        
        showLoading(menuContainer);
        
        const response = await fetch(`${API_BASE}/menu`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const menuItems = await response.json();
        console.log('All menu items loaded:', menuItems);
        
        displayMenuItems(menuItems, menuContainer);
        
    } catch (error) {
        console.error('Error loading menu items:', error);
        const menuContainer = document.getElementById('menu-items-container');
        if (menuContainer) {
            showError(menuContainer, 'Failed to load menu items. Please try again later.');
        }
    }
}

// Function to load menu by category
async function loadMenuByCategory(category) {
    try {
        const menuContainer = document.getElementById('menu-items-container');
        if (!menuContainer) return;
        
        showLoading(menuContainer);
        
        const response = await fetch(`${API_BASE}/menu/category/${category}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const menuItems = await response.json();
        console.log(`Category ${category} items:`, menuItems);
        
        displayMenuItems(menuItems, menuContainer);
        
    } catch (error) {
        console.error(`Error loading ${category} menu:`, error);
        const menuContainer = document.getElementById('menu-items-container');
        if (menuContainer) {
            showError(menuContainer, `Failed to load ${category} menu. Please try again later.`);
        }
    }
}

// Function to filter by dietary restrictions
async function filterByDietaryRestrictions() {
    try {
        const menuContainer = document.getElementById('menu-items-container');
        if (!menuContainer) return;
        
        showLoading(menuContainer);
        
        const response = await fetch(`${API_BASE}/menu`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const allItems = await response.json();
        const healthyItems = allItems.filter(item => item.dietary && item.dietary.length > 0);
        
        displayMenuItems(healthyItems, menuContainer);
        
    } catch (error) {
        console.error('Error filtering dietary restrictions:', error);
        const menuContainer = document.getElementById('menu-items-container');
        if (menuContainer) {
            showError(menuContainer, 'Failed to load dietary restriction items.');
        }
    }
}

// Cart functionality
function attachCartEventListeners() {
    document.querySelectorAll('.add-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            try {
                const itemData = JSON.parse(this.getAttribute('data-item'));
                addToCart(itemData);
                
                // Visual feedback
                const originalText = this.textContent;
                this.textContent = 'Added!';
                this.style.backgroundColor = '#4CAF50';
                
                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.backgroundColor = '';
                }, 1000);
                
            } catch (error) {
                console.error('Error adding item to cart:', error);
            }
        });
    });
}

function addToCart(item) {
    let cart = JSON.parse(localStorage.getItem('freshbite-cart')) || [];
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...item, quantity: 1 });
    }
    
    localStorage.setItem('freshbite-cart', JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('freshbite-cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    let badge = document.querySelector('.cart-badge');
    const floatingCart = document.querySelector('.floating-cart');
    
    if (!badge && floatingCart) {
        badge = document.createElement('span');
        badge.className = 'cart-badge';
        floatingCart.appendChild(badge);
    }
    
    if (badge) {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing menu...');
    
    // Debug: Check what page we're on and what elements exist
    console.log('Current page:', window.location.pathname);
    console.log('Special items section:', document.querySelector('.special-items'));
    console.log('Menu container:', document.getElementById('menu-items-container'));
    
    // Initialize cart badge
    updateCartBadge();
    
    // Load today's specials (only on home page)
    if (document.querySelector('.special-items')) {
        console.log('Home page detected, loading today\'s specials...');
        loadTodaysMenu(); // This function was missing!
    }
    
    // Load all menu categories (only on menu page)
    if (document.getElementById('menu-items-container')) {
        console.log('Menu page detected, loading all items...');
        loadAllMenuItems();
    }
    
    // Category buttons functionality (for menu.html)
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const category = this.getAttribute('data-category');
            console.log('Category button clicked:', category);
            
            if (category === 'all') {
                loadAllMenuItems();
            } else if (category === 'healthy') {
                filterByDietaryRestrictions();
            } else {
                loadMenuByCategory(category);
            }
        });
    });
});