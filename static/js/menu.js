document.addEventListener("DOMContentLoaded", function () {

  // Detect structure type
  const menuContainer = document.getElementById("menu-items-container");
  const noItemsMessage = document.getElementById("no-items-message");
  const categorySelect = document.getElementById("menuCategory");

  // Use static HTML or dynamic menu
  if (!menuContainer) {
    setupExistingMenu();
  } else {
    setupDynamicMenu();
  }

  // ============================================
  // STATIC EXISTING MENU SETUP
  // ============================================
  function setupExistingMenu() {
    if (categorySelect) {
      categorySelect.addEventListener("change", function () {
        const selected = this.value;
        const categories = document.querySelectorAll(".menu-category");

        categories.forEach(cat => {
          if (selected === "all" || cat.id === selected) {
            cat.style.display = "block";
          } else {
            cat.style.display = "none";
          }
        });
      });
    }

    setupCart();
  }

  // ============================================
  // DYNAMIC MENU (LOCALSTORAGE LOADED ITEMS)
  // ============================================
  function setupDynamicMenu() {

    function renderMenu(filtered = "all") {
      const items = JSON.parse(localStorage.getItem("menuItems")) || [];

      if (!menuContainer) return;

      menuContainer.innerHTML = "";

      if (items.length === 0) {
        if (noItemsMessage) noItemsMessage.style.display = "block";
        return;
      } else {
        if (noItemsMessage) noItemsMessage.style.display = "none";
      }

      let visible = [];

      if (filtered === "all") {
        visible = items;
      } else if (filtered === "healthy") {
        visible = items.filter(i => i.dietary && i.dietary.length > 0);
      } else {
        visible = items.filter(
          i =>
            i.category &&
            i.category.toLowerCase() === filtered.toLowerCase()
        );
      }

      if (visible.length === 0) {
        menuContainer.innerHTML =
          '<p style="text-align:center; padding: 40px;">No items found in this category.</p>';
        return;
      }

      visible.forEach(item => {
        const card = document.createElement("div");
        card.className = "menu-item";

        card.innerHTML = `
          <div class="item-image">
            <img src="${item.image || "images/default.jpg"}"
                 alt="${item.name}"
                 onerror="this.src='images/default.jpg'">
            ${item.category ? `<span class="badge">${item.category}</span>` : ""}
          </div>

          <div class="item-info">
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <p class="price">€${item.price ? item.price.toFixed(2) : "0.00"}</p>

            ${
              item.dietary && item.dietary.length > 0
                ? `<p class="dietary" style="font-size:0.8rem; color:#ff7b00;">
                    <strong>Dietary:</strong> ${item.dietary.join(", ")}
                  </p>`
                : ""
            }

            <button class="add-cart-btn">Add to Cart</button>
          </div>
        `;

        menuContainer.appendChild(card);
      });

      // Re-attach cart button listeners
      document.querySelectorAll(".add-cart-btn").forEach(btn => {
        btn.addEventListener("click", addToCart);
      });
    }

    if (categorySelect) {
      categorySelect.addEventListener("change", function () {
        renderMenu(this.value);
      });
    }

    renderMenu();
    setupCart();
  }

  // ============================================
  // CART SYSTEM
  // ============================================
  function setupCart() {

    let cart = [];

    function addToCart(e) {
      const button = e.target;
      const itemEl = button.closest(".menu-item, .special-item");

      if (!itemEl) return;

      const name = itemEl.querySelector("h3")?.textContent || "Unknown Item";
      const priceText = itemEl.querySelector(".price")?.textContent || "€0";
      const price = parseFloat(priceText.replace("€", "")) || 0;

      cart.push({ name, price, quantity: 1 });
      updateCartDisplay();

      showAddedFeedback(button);

      const sidebar = document.querySelector(".cart-sidebar");
      if (sidebar) sidebar.classList.add("show");
    }

    function updateCartDisplay() {
      const cartItems = document.querySelector(".cart-items");
      const cartTotal = document.querySelector(".cart-total strong");

      if (!cartItems || !cartTotal) return;

      cartItems.innerHTML = "";

      if (cart.length === 0) {
        cartItems.innerHTML = "<p>No items added yet.</p>";
        cartTotal.textContent = "€0.00";
        updateCartBadge(0);
        return;
      }

      let total = 0;
      let count = 0;

      cart.forEach((item, index) => {
        total += item.price * item.quantity;
        count += item.quantity;

        const row = document.createElement("div");
        row.className = "cart-item";

        row.innerHTML = `
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <p>€${item.price.toFixed(2)} × ${item.quantity}</p>
          </div>
          <button class="remove-item" data-index="${index}">Remove</button>
        `;

        cartItems.appendChild(row);
      });

      document.querySelectorAll(".remove-item").forEach(btn => {
        btn.addEventListener("click", removeItem);
      });

      cartTotal.textContent = `€${total.toFixed(2)}`;
      updateCartBadge(count);
    }

    function removeItem(e) {
      const index = parseInt(e.target.getAttribute("data-index"));
      cart.splice(index, 1);
      updateCartDisplay();
    }

    function updateCartBadge(count) {
      const cartButton = document.querySelector(".floating-cart");
      if (!cartButton) return;

      let badge = cartButton.querySelector(".cart-badge");
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "cart-badge";
        cartButton.appendChild(badge);
      }

      badge.textContent = count;
    }

    function showAddedFeedback(btn) {
      const original = btn.textContent;
      btn.textContent = "Added!";
      btn.style.backgroundColor = "#4CAF50";

      setTimeout(() => {
        btn.textContent = original;
        btn.style.backgroundColor = "";
      }, 900);
    }

    // Attach cart listeners on load
    document.querySelectorAll(".add-cart-btn").forEach(btn => {
      btn.addEventListener("click", addToCart);
    });

    const floatingCart = document.querySelector(".floating-cart");
    const cartSidebar = document.querySelector(".cart-sidebar");

    if (floatingCart && cartSidebar) {
      floatingCart.addEventListener("click", () => {
        cartSidebar.classList.toggle("show");
      });
    }

    // Checkout
    const checkout = document.querySelector(".checkout-btn");
    if (checkout) {
      checkout.addEventListener("click", function () {
        if (cart.length === 0) {
          alert("Your cart is empty.");
          return;
        }

        const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

        alert(`Order placed! Total: €${total.toFixed(2)}`);
        cart = [];
        updateCartDisplay();
        cartSidebar.classList.remove("show");
      });
    }

    // Close cart when clicking outside
    document.addEventListener("click", function (e) {
      if (
        cartSidebar &&
        cartSidebar.classList.contains("show") &&
        !cartSidebar.contains(e.target) &&
        !floatingCart.contains(e.target)
      ) {
        cartSidebar.classList.remove("show");
      }
    });
  }
});
