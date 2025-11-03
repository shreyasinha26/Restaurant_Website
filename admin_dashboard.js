// Simple in-memory API for menu items
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
    item.id = Date.now().toString(); // Simple ID generation
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
}