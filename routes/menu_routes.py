from flask import Blueprint, jsonify, request, current_app
from models.menu_model import MenuModel
from controllers.menu_controller import get_menu, get_todays_menu, get_menu_by_category, add_menu_item

menu_bp = Blueprint('menu_bp', __name__, url_prefix='/api/menu')

def get_model():
    # current_app.mongo_db must be set in app.py during startup
    return MenuModel(current_app.mongo_db['menu_items'])

@menu_bp.route('/', methods=['GET'])
def route_get_menu():
    model = get_model()
    items = get_menu(model)
    return jsonify(items), 200

@menu_bp.route('/today', methods=['GET'])
def route_get_todays_menu():
    model = get_model()
    items = get_todays_menu(model)
    return jsonify(items), 200

@menu_bp.route('/category/<category>', methods=['GET'])
def route_get_category(category):
    model = get_model()
    items = get_menu_by_category(model, category)
    return jsonify(items), 200

@menu_bp.route('/', methods=['POST'])
def route_add_menu_item():
    model = get_model()
    data = request.get_json()
    try:
        new_id = add_menu_item(model, data)
        return jsonify({'message': 'Menu item added', 'id': new_id}), 201
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500
