from flask import Blueprint, request
from controllers.menu_controller import MenuController

# Blueprint for menu routes
menu_bp = Blueprint('menu_bp', __name__, url_prefix='/api/menu')

# Controller instance
menu_controller = MenuController()

# -------------------------------
# GET: All menu items
# -------------------------------
@menu_bp.route('/', methods=['GET'])
def get_menu():
    return menu_controller.get_all_menu_items()

# -------------------------------
# GET: Today's menu items
# -------------------------------
@menu_bp.route('/today', methods=['GET'])
def get_todays_menu():
    return menu_controller.get_todays_menu()

# -------------------------------
# GET: Menu items by category
# -------------------------------
@menu_bp.route('/category/<category>', methods=['GET'])
def get_menu_by_category(category):
    return menu_controller.get_menu_by_category(category)

# -------------------------------
# GET: Single menu item by ID
# -------------------------------
@menu_bp.route('/<item_id>', methods=['GET'])
def get_menu_item(item_id):
    return menu_controller.get_menu_item(item_id)

# -------------------------------
# POST: Create new menu item
# -------------------------------
@menu_bp.route('/', methods=['POST'])
def create_menu_item():
    return menu_controller.create_menu_item()

# -------------------------------
# PUT: Update menu item
# -------------------------------
@menu_bp.route('/<item_id>', methods=['PUT'])
def update_menu_item(item_id):
    return menu_controller.update_menu_item(item_id)

# -------------------------------
# DELETE: Delete menu item
# -------------------------------
@menu_bp.route('/<item_id>', methods=['DELETE'])
def delete_menu_item(item_id):
    return menu_controller.delete_menu_item(item_id)
