document.addEventListener("DOMContentLoaded", function () {
  // Check if we're using the new dynamic menu or existing HTML structure
  const menuContainer = document.getElementById("menu-items-container");
  const noItemsMessage = document.getElementById("no-items-message");
  const categorySelect = document.getElementById("menuCategory");
  
  // If using existing HTML structure (your current setup)
  if (!menuContainer) {
    setupExistingMenu();
  } else {
    setupDynamicMenu();
  }

  function setupExistingMenu() {
    // Category filter for existing HTML
    if (categorySelect) {
      categorySelect.addEventListener("change", function() {
        const selectedCategory = this.value;
        const allCategories = document.querySelectorAll('.menu-category');
        
        allCategories.forEach(category => {
          if (selectedCategory === 'all' || category.id === selectedCategory) {
            category.style.display = 'block';
          } else {
            category.style.display = 'none';
          }
        });
      });
    }

    // Cart functionality for existing HTML
    setupCart();
  }

  function setupDynamicMenu() {
    // Your original dynamic menu code
    function renderMenu(filteredCategory = "all") {
      const items = JSON.parse(localStorage.getItem("menuItems")) || [];

      menuContainer.innerHTML = "";
      if (items.length === 0) {
        noItemsMessage.style.display = "block";
        return;
      } else {
        noItemsMessage.style.display = "none";
      }

      let visibleItems;
      if (filteredCategory === "all") {
        visibleItems = items;
      } else if (filteredCategory === "healthy") {
        visibleItems = items.filter(
          (item) => item.dietary && item.dietary.length > 0
        );
      } else {
        visibleItems = items.filter(
          (item) =>
            item.category &&
            item.category.toLowerCase() === filteredCategory.toLowerCase()
        );
      }

      if (visibleItems.length === 0) {
        menuContainer.innerHTML =
          '<p style="text-align:center; color:#555; grid-column: 1 / -1; padding: 40px;">No items found in this category.</p>';
        return;
      }

      visibleItems.forEach((item) => {
        const card = document.createElement("div");
        card.className = "menu-item";
        card.innerHTML = `
          <div class="item-image">
            <img src="${item.image || "images/default.jpg"}" alt="${item.name}" onerror="this.src='images/default.jpg'">
            ${item.category ? `<span class="badge">${item.category}</span>` : ""}
          </div>
          <div class="item-info">
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <p class="price">€${item.price ? item.price.toFixed(2) : "0.00"}</p>
            ${
              item.dietary && item.dietary.length > 0
                ? `<p class="dietary" style="margin-top: 8px; font-size: 0.8rem; color: #ff7b00; font-weight: 600;">
                    <strong>Dietary:</strong> ${item.dietary.join(", ")}
                  </p>`
                : ""
            }
            <button class="add-cart-btn">Add to Cart</button>
          </div>
        `;
        menuContainer.appendChild(card);
      });

      // Re-attach cart event listeners
      document.querySelectorAll('.add-cart-btn').forEach(button => {
        button.addEventListener('click', addToCart);
      });
    }

    if (categorySelect) {
      categorySelect.addEventListener("change", function() {
        const category = this.value;
        renderMenu(category);
      });
    }

    renderMenu();
    setupCart();
  }

  function setupCart() {
    let cart = [];
    
    // Add to cart functionality
    function addToCart(event) {
      const button = event.target;
      const itemElement = button.closest('.menu-item, .special-item');
      
      if (!itemElement) return;
      
      const name = itemElement.querySelector('h3').textContent;
      const priceText = itemElement.querySelector('.price').textContent;
      const price = parseFloat(priceText.replace('€', '').trim());
      
      // Add to cart
      cart.push({ name, price, quantity: 1 });
      updateCartDisplay();
      
      // Show feedback
      showAddedFeedback(button);
      
      // Show cart sidebar
      const cartSidebar = document.querySelector('.cart-sidebar');
      if (cartSidebar) {
        cartSidebar.classList.add('show');
      }
    }

    function updateCartDisplay() {
      const cartItems = document.querySelector('.cart-items');
      const cartTotal = document.querySelector('.cart-total strong');
      const floatingCart = document.querySelector('.floating-cart');
      
      if (!cartItems || !cartTotal) return;
      
      cartItems.innerHTML = '';
      
      if (cart.length === 0) {
        cartItems.innerHTML = '<p>No items added yet.</p>';
        cartTotal.textContent = '€0.00';
        updateCartBadge(0);
        return;
      }
      
      let total = 0;
      let itemCount = 0;
      
      cart.forEach((item, index) => {
        total += item.price * item.quantity;
        itemCount += item.quantity;
        
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <p>€${item.price.toFixed(2)} × ${item.quantity}</p>
          </div>
          <button class="remove-item" data-index="${index}">Remove</button>
        `;
        
        cartItems.appendChild(cartItemElement);
      });
      
      // Add remove event listeners
      document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', removeItem);
      });
      
      cartTotal.textContent = `€${total.toFixed(2)}`;
      updateCartBadge(itemCount);
    }

    function removeItem(event) {
      const index = parseInt(event.target.getAttribute('data-index'));
      cart.splice(index, 1);
      updateCartDisplay();
    }

    function updateCartBadge(count) {
      const floatingCart = document.querySelector('.floating-cart');
      if (!floatingCart) return;
      
      let badge = floatingCart.querySelector('.cart-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'cart-badge';
        floatingCart.appendChild(badge);
      }
      
      badge.textContent = count;
    }

    function showAddedFeedback(button) {
      const originalText = button.textContent;
      button.textContent = 'Added!';
      button.style.backgroundColor = '#4CAF50';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
      }, 1000);
    }

    // Add event listeners to existing cart buttons
    document.querySelectorAll('.add-cart-btn').forEach(button => {
      button.addEventListener('click', addToCart);
    });

    // Cart toggle
    const floatingCart = document.querySelector('.floating-cart');
    const cartSidebar = document.querySelector('.cart-sidebar');
    
    if (floatingCart && cartSidebar) {
      floatingCart.addEventListener('click', function() {
        cartSidebar.classList.toggle('show');
      });
    }

    // Checkout
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
          alert('Your cart is empty. Please add some items before checking out.');
          return;
        }
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        alert(`Order placed! Total: €${total.toFixed(2)}\nThank you for your order!`);
        
        cart = [];
        updateCartDisplay();
        cartSidebar.classList.remove('show');
      });
    }

    // Close cart when clicking outside
    document.addEventListener('click', function(event) {
      const cartSidebar = document.querySelector('.cart-sidebar');
      const floatingCart = document.querySelector('.floating-cart');
      
      if (cartSidebar && cartSidebar.classList.contains('show') &&
          !cartSidebar.contains(event.target) &&
          !floatingCart.contains(event.target)) {
        cartSidebar.classList.remove('show');
      }
    });
  }
});