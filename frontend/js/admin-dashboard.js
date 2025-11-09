const menuAPI = {
  // Get all menu items
  getMenuItems: function() {
    const items = localStorage.getItem('menuItems');
    return items ? JSON.parse(items) : [];
  },
  
  // Save menu items
  saveMenuItems: function(items) {
    localStorage.setItem('menuItems', JSON.stringify(items));
  },
  
  // Add new menu item
  addMenuItem: function(item) {
    const items = this.getMenuItems();
    item.id = Date.now().toString();
    items.push(item);
    this.saveMenuItems(items);
    return item;
  },
  
  // Update menu item
  updateMenuItem: function(id, updatedItem) {
    const items = this.getMenuItems();
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = {...items[index], ...updatedItem};
      this.saveMenuItems(items);
      return items[index];
    }
    return null;
  },
  
  // Delete menu item
  deleteMenuItem: function(id) {
    const items = this.getMenuItems();
    const filteredItems = items.filter(item => item.id !== id);
    this.saveMenuItems(filteredItems);
    return filteredItems;
  },
  
  // Get today's menu based on current day
  getTodaysMenu: function() {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    const items = this.getMenuItems();
    return items.filter(item => item.day === today);
  }
};

// Admin Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
  const menuItemsContainer = document.getElementById('menu-items-container');
  const addItemBtn = document.getElementById('add-item-btn');
  const itemModal = document.getElementById('item-modal');
  const itemForm = document.getElementById('item-form');
  const closeModal = document.querySelector('.close');
  const cancelBtn = document.getElementById('cancel-btn');
  const modalTitle = document.getElementById('modal-title');
  
  let editingItemId = null;
  
  // Load initial sample data if empty
  initializeSampleData();
  
  // Load menu items
  loadMenuItems();
  updateDashboardStats();
  
  // Event listeners
  addItemBtn.addEventListener('click', openAddModal);
  closeModal.addEventListener('click', closeItemModal);
  cancelBtn.addEventListener('click', closeItemModal);
  
  // Close modal when clicking outside
  window.addEventListener('click', function(event) {
    if (event.target === itemModal) {
      closeItemModal();
    }
  });
  
  // Form submission
  itemForm.addEventListener('submit', function(e) {
    e.preventDefault();
    saveMenuItem();
  });
  
  function initializeSampleData() {
    const items = menuAPI.getMenuItems();
    if (items.length === 0) {
      const sampleItems = [
        {
          id: '1',
          name: 'Classic Beef Burger',
          description: 'Juicy beef patty with lettuce, tomato, onion, and our special sauce',
          price: 12.50,
          category: 'burgers',
          dietary: [],
          image: 'images/Classic_Beef_Burger.jpeg',
          day: 'monday'
        },
        {
          id: '2',
          name: 'Margherita Pizza',
          description: 'Classic tomato sauce, mozzarella, and fresh basil',
          price: 14.00,
          category: 'pizzas',
          dietary: ['vegetarian'],
          image: 'images/margherita_pizza.jpg',
          day: 'tuesday'
        }
      ];
      localStorage.setItem('menuItems', JSON.stringify(sampleItems));
    }
  }
  
  function loadMenuItems() {
    const items = menuAPI.getMenuItems();
    menuItemsContainer.innerHTML = '';
    
    if (items.length === 0) {
      menuItemsContainer.innerHTML = '<p>No menu items yet. Add your first item!</p>';
      return;
    }
    
    items.forEach(item => {
      const itemCard = document.createElement('div');
      itemCard.className = 'menu-item-card';
      itemCard.innerHTML = `
        <div class="item-info">
          <h4>${item.name} - €${item.price}</h4>
          <p>${item.description}</p>
          <small>Category: ${item.category} | Dietary: ${item.dietary ? item.dietary.join(', ') : 'None'} ${item.day ? `| Day: ${item.day}` : ''}</small>
        </div>
        <div class="item-actions">
          <button class="edit-btn" data-id="${item.id}">Edit</button>
          <button class="delete-btn" data-id="${item.id}">Delete</button>
        </div>
      `;
      menuItemsContainer.appendChild(itemCard);
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        openEditModal(id);
      });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        deleteMenuItem(id);
      });
    });
  }
  
  function openAddModal() {
    editingItemId = null;
    modalTitle.textContent = 'Add Menu Item';
    itemForm.reset();
    itemModal.style.display = 'block';
  }
  
  function openEditModal(id) {
    const items = menuAPI.getMenuItems();
    const item = items.find(i => i.id === id);
    
    if (item) {
      editingItemId = id;
      modalTitle.textContent = 'Edit Menu Item';
      
      document.getElementById('item-id').value = item.id;
      document.getElementById('item-name').value = item.name;
      document.getElementById('item-description').value = item.description;
      document.getElementById('item-price').value = item.price;
      document.getElementById('item-category').value = item.category;
      document.getElementById('item-image').value = item.image || '';
      document.getElementById('item-day').value = item.day || '';
      
      // Reset checkboxes
      document.querySelectorAll('input[name="dietary"]').forEach(checkbox => {
        checkbox.checked = false;
      });
      
      // Set dietary checkboxes
      if (item.dietary) {
        item.dietary.forEach(diet => {
          const checkbox = document.querySelector(`input[name="dietary"][value="${diet}"]`);
          if (checkbox) checkbox.checked = true;
        });
      }
      
      itemModal.style.display = 'block';
    }
  }
  
  function closeItemModal() {
    itemModal.style.display = 'none';
    editingItemId = null;
  }
  
  function saveMenuItem() {
    const formData = new FormData(itemForm);
    const dietary = [];
    document.querySelectorAll('input[name="dietary"]:checked').forEach(checkbox => {
      dietary.push(checkbox.value);
    });
    
    const itemData = {
      name: document.getElementById('item-name').value,
      description: document.getElementById('item-description').value,
      price: parseFloat(document.getElementById('item-price').value),
      category: document.getElementById('item-category').value,
      dietary: dietary,
      image: document.getElementById('item-image').value,
      day: document.getElementById('item-day').value
    };
    
    if (editingItemId) {
      menuAPI.updateMenuItem(editingItemId, itemData);
    } else {
      menuAPI.addMenuItem(itemData);
    }
    
    closeItemModal();
    loadMenuItems();
    updateDashboardStats();
  }
  
  function deleteMenuItem(id) {
    if (confirm('Are you sure you want to delete this menu item?')) {
      menuAPI.deleteMenuItem(id);
      loadMenuItems();
      updateDashboardStats();
    }
  }
  
  function updateDashboardStats() {
    const items = menuAPI.getMenuItems();
    const todaysItems = menuAPI.getTodaysMenu();
    const specials = items.filter(item => item.day);
    
    document.getElementById('today-menu-count').textContent = `${todaysItems.length} items`;
    document.getElementById('total-menu-count').textContent = `${items.length} items`;
    document.getElementById('specials-count').textContent = `${specials.length} items`;
  }
});
function saveMenuItem() {
    const formData = new FormData(itemForm);
    const dietary = [];
    document.querySelectorAll('input[name="dietary"]:checked').forEach(checkbox => {
        dietary.push(checkbox.value);
    });
    
    const itemData = {
        name: document.getElementById('item-name').value,
        description: document.getElementById('item-description').value,
        price: parseFloat(document.getElementById('item-price').value),
        category: document.getElementById('item-category').value,
        dietary: dietary,
        image: document.getElementById('item-image').value,
        day: document.getElementById('item-day').value
    };
    
    if (editingItemId) {
        menuAPI.updateMenuItem(editingItemId, itemData);
    } else {
        menuAPI.addMenuItem(itemData);
    }
    
    closeItemModal();
    loadMenuItems();
    updateDashboardStats();
    
    // Show success message
    showNotification('Menu item saved successfully!', 'success');
}

// Add notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles if not exists
    if (!document.getElementById('notification-styles')) {
        const styles = `
            <style id="notification-styles">
            .notification {
                position: fixed;
                top: 100px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 600;
                z-index: 10000;
                animation: slideIn 0.3s ease;
            }
            .notification-success { background: #4CAF50; }
            .notification-error { background: #F44336; }
            .notification-info { background: #2196F3; }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            </style>
        `;
        document.head.insertAdjacentHTML('beforeend', styles);
    }
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}