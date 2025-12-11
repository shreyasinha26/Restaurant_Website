// API base URL
const API_BASE = '/app/api';

// Safe loading function
function showLoading(element) {
    if (!element) return;
    element.innerHTML = '<div class="loading">Loading menu items...</div>';
}

// Safe error display
function showError(element, message) {
    if (!element) return;
    element.innerHTML = `<div class="error-message">${message}</div>`;
}

// ----------------------------
// Load Today's Specials
// ----------------------------
async function loadTodaysMenu() {
    try {
        const todaySpecialSection = document.querySelector('.special-items');
        if (!todaySpecialSection) return; // Prevent crash

        showLoading(todaySpecialSection);

        const response = await fetch(`${API_BASE}/menu/today`);
        if (!response.ok) throw new Error(response.status);

        const menuItems = await response.json();

        if (!Array.isArray(menuItems)) {
            showError(todaySpecialSection, "Invalid server response.");
            return;
        }

        if (menuItems.length > 0) {
            todaySpecialSection.innerHTML = menuItems.map(item => `
                <div class="special-item">
                    <img src="${item.image}" alt="${item.name}" 
                         onerror="this.src='/static/images/default.jpg'">
                    <div class="special-info">
                        <h3>${item.name}</h3>
                        <p>${item.description}</p>
                        ${item.dietary && item.dietary.length > 0
                            ? `<div class="dietary-tags">
                                ${item.dietary.map(tag => `<span class="dietary-tag">${tag}</span>`).join('')}
                               </div>`
                            : ''}
                        <span class="price">€${item.price.toFixed(2)}</span>
                        <button class="add-cart-btn" 
                                data-item='${JSON.stringify(item).replace(/'/g, "&#39;")}'>
                                Add to Cart
                        </button>
                    </div>
                </div>
            `).join('');

            attachCartEventListeners();
        } else {
            todaySpecialSection.innerHTML = '<div class="no-items">No specials today.</div>';
        }

    } catch (error) {
        console.error("Today's menu error:", error);
        const section = document.querySelector('.special-items');
        showError(section, 'Failed to load today\'s specials.');
    }
}

// ----------------------------
// Render Menu Items
// ----------------------------
function displayMenuItems(menuItems, container) {
    if (!container) return;

    if (!Array.isArray(menuItems)) {
        showError(container, "Invalid menu data.");
        return;
    }

    if (menuItems.length === 0) {
        container.innerHTML = '<p class="no-items">No items found.</p>';
        return;
    }

    container.innerHTML = menuItems.map(item => `
        <div class="menu-item">
            <div class="item-image">
                <img src="${item.image}" alt="${item.name}" 
                    onerror="this.style.display='none'">
            </div>
            <div class="item-info">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                ${item.dietary && item.dietary.length > 0 
                    ? `<div class="dietary-tags">
                        ${item.dietary.map(tag => `<span class="dietary-tag">${tag}</span>`).join('')}
                      </div>`
                    : ''}
                <div class="price">€${item.price.toFixed(2)}</div>
                <button class="add-cart-btn"
                        data-item='${JSON.stringify(item).replace(/'/g, "&#39;")}'>
                        Add to Cart
                </button>
            </div>
        </div>
    `).join('');

    attachCartEventListeners();
}

// ----------------------------
// Load All Menu Items
// ----------------------------
async function loadAllMenuItems() {
    const container = document.getElementById('menu-items-container');
    if (!container) return;

    showLoading(container);

    try {
        const response = await fetch(`${API_BASE}/menu`);
        if (!response.ok) throw new Error(response.status);

        const items = await response.json();
        displayMenuItems(items, container);

    } catch (error) {
        console.error("Load all menu error:", error);
        showError(container, "Failed to load menu items.");
    }
}

// ----------------------------
// Load by Category
// ----------------------------
async function loadMenuByCategory(category) {
    const container = document.getElementById('menu-items-container');
    if (!container) return;

    showLoading(container);

    try {
        const response = await fetch(`${API_BASE}/menu/category/${category}`);
        if (!response.ok) throw new Error(response.status);

        const items = await response.json();
        displayMenuItems(items, container);

    } catch (error) {
        console.error(`Category ${category} error:`, error);
        showError(container, `Failed to load ${category} items.`);
    }
}

// ----------------------------
// Dietary Filter
// ----------------------------
async function filterByDietaryRestrictions() {
    const container = document.getElementById('menu-items-container');
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE}/menu`);
        if (!response.ok) throw new Error(response.status);

        const allItems = await response.json();
        const healthy = allItems.filter(item => item.dietary && item.dietary.length > 0);

        displayMenuItems(healthy, container);

    } catch (error) {
        showError(container, "Failed to load dietary items.");
    }
}

// ----------------------------
// Cart System (Safe)
// ----------------------------
function attachCartEventListeners() {
    document.querySelectorAll('.add-cart-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            try {
                const item = JSON.parse(btn.getAttribute('data-item'));
                addToCart(item);

                const original = btn.textContent;
                btn.textContent = "Added!";
                btn.style.backgroundColor = "#4CAF50";

                setTimeout(() => {
                    btn.textContent = original;
                    btn.style.backgroundColor = "";
                }, 800);

            } catch (e) {
                console.error("Cart error:", e);
            }
        });
    });
}

function addToCart(item) {
    if (!item) return;

    const cart = JSON.parse(localStorage.getItem("freshbite-cart")) || [];
    const existing = cart.find(i => i.id === item.id);

    if (existing) existing.quantity++;
    else cart.push({ ...item, quantity: 1 });

    localStorage.setItem("freshbite-cart", JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('freshbite-cart')) || [];
    const total = cart.reduce((sum, i) => sum + i.quantity, 0);

    const floatingCart = document.querySelector('.floating-cart');
    if (!floatingCart) return;

    let badge = document.querySelector('.cart-badge');
    if (!badge) {
        badge = document.createElement('span');
        badge.className = 'cart-badge';
        floatingCart.appendChild(badge);
    }

    badge.textContent = total;
    badge.style.display = total > 0 ? 'block' : 'none';
}

// ----------------------------
// INIT Page
// ----------------------------
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();

    if (document.querySelector('.special-items')) {
        loadTodaysMenu();
    }

    if (document.getElementById('menu-items-container')) {
        loadAllMenuItems();
    }

    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const cat = btn.getAttribute('data-category');

            if (cat === 'all') loadAllMenuItems();
            else if (cat === 'healthy') filterByDietaryRestrictions();
            else loadMenuByCategory(cat);
        });
    });
});
