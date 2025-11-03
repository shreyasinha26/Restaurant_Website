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
    const visibleItems =
      filteredCategory === "all"
        ? items
        : items.filter(
            (item) =>
              item.category &&
              item.category.toLowerCase() === filteredCategory.toLowerCase()
          );

    if (visibleItems.length === 0) {
      menuContainer.innerHTML =
        '<p style="text-align:center; color:#555;">No items found in this category.</p>';
      return;
    }
    // Create cards
    visibleItems.forEach((item) => {
      const card = document.createElement("div");
      card.className = "menu-item";
      card.innerHTML = `
        <div class="item-image">
          <img src="${item.image || "images/default.jpg"}" alt="${item.name}">
          ${item.category ? `<span class="badge">${item.category}</span>` : ""}
        </div>
        <div class="item-info">
          <h3>${item.name}</h3>
          <p>${item.description}</p>
          <p class="price">€${item.price ? item.price.toFixed(2) : "0.00"}</p>
          ${
            item.dietary && item.dietary.length > 0
              ? `<p class="dietary"><strong>Dietary:</strong> ${item.dietary.join(
                  ", "
                )}</p>`
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

