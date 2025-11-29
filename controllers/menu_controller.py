from flask import jsonify, request, current_app
from datetime import datetime
from models.menu_model import MenuModel

class MenuController:
    def __init__(self):
        # Don't initialize model here, do it in methods
        self._menu_model = None

    @property
    def menu_model(self):
        if self._menu_model is None:
            self._menu_model = MenuModel(current_app.mongo_db)
        return self._menu_model

    def get_all_menu_items(self):
        try:
            items = self.menu_model.get_all_items()
            # Convert ObjectId to string
            for item in items:
                item['_id'] = str(item['_id'])
            return jsonify(items), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    def get_todays_menu(self):
        try:
            today = datetime.now().strftime('%A').lower()
            items = self.menu_model.get_todays_items(today)
            # Convert ObjectId to string
            for item in items:
                item['_id'] = str(item['_id'])
            return jsonify(items), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    def get_menu_by_category(self, category):
        try:
            items = self.menu_model.get_items_by_category(category)
            # Convert ObjectId to string
            for item in items:
                item['_id'] = str(item['_id'])
            return jsonify(items), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    def get_menu_item(self, item_id):
        try:
            item = self.menu_model.get_item_by_id(item_id)
            if not item:
                return jsonify({'error': 'Menu item not found'}), 404
            item['_id'] = str(item['_id'])
            return jsonify(item), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    def create_menu_item(self):
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'No data provided'}), 400

            item_id = self.menu_model.create_item(data)
            return jsonify({
                'message': 'Menu item added successfully',
                'id': item_id
            }), 201

        except ValueError as ve:
            return jsonify({'error': str(ve)}), 400
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    def update_menu_item(self, item_id):
        try:
            data = request.get_json()
            if not data:
                return jsonify({'error': 'No data provided'}), 400

            # Prepare update fields
            update_fields = {}
            if 'name' in data:
                update_fields['name'] = data['name'].strip()
            if 'category' in data:
                update_fields['category'] = data['category'].strip()
            if 'price' in data:
                update_fields['price'] = data['price']
            if 'description' in data:
                update_fields['description'] = data['description'].strip()
            if 'ingredients' in data:
                update_fields['ingredients'] = data['ingredients']
            if 'day' in data:
                update_fields['day'] = data['day'].lower()
            if 'available' in data:
                update_fields['available'] = bool(data['available'])
            if 'image_url' in data:
                update_fields['image_url'] = data['image_url']

            if not update_fields:
                return jsonify({'error': 'No valid fields to update'}), 400

            success = self.menu_model.update_item(item_id, update_fields)
            if not success:
                return jsonify({'error': 'Menu item not found'}), 404

            return jsonify({'message': 'Menu item updated successfully'}), 200

        except ValueError as ve:
            return jsonify({'error': str(ve)}), 400
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    def delete_menu_item(self, item_id):
        try:
            success = self.menu_model.delete_item(item_id)
            if not success:
                return jsonify({'error': 'Menu item not found'}), 404

            return jsonify({'message': 'Menu item deleted successfully'}), 200

        except Exception as e:
            return jsonify({'error': str(e)}), 500