document.addEventListener("DOMContentLoaded", function () {
  const menuContainer = document.getElementById("menu-items-container");
  const noItemsMessage = document.getElementById("no-items-message");
  const categoryButtons = document.querySelectorAll(".category-btn");

  function renderMenu(filteredCategory = "all") {
    const items = JSON.parse(localStorage.getItem("menuItems")) || [];

    menuContainer.innerHTML = "";
    if (items.length === 0) {
      noItemsMessage.style.display = "block";
      return;
    } else {
      noItemsMessage.style.display = "none";
    }
    // Filter items by category
    let visibleItems;
      if (filteredCategory === "all") {
          visibleItems = items;
      } else if (filteredCategory === "healthy") {
    // Show items that have any dietary restrictions
    visibleItems = items.filter(
        (item) => item.dietary && item.dietary.length > 0
        );
      } else {
   // Filter by regular category
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
    // Create cards
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
        </div>
      `;
      menuContainer.appendChild(card);
    });
  }
  // Category filter logic
  categoryButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      categoryButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const category = btn.getAttribute("data-category");
      renderMenu(category);
    });
  });
  // Load all menu items initially
  renderMenu();
});

