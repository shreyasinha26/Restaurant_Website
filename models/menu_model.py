from datetime import datetime
from bson import ObjectId
from validators.schemas import MenuSchema
from validators.sanitizers import Sanitizer

class MenuModel:
    def __init__(self, db):
        self.collection = db['menu_items']

    def get_all_items(self):
        return list(self.collection.find({}))

    def get_todays_items(self, day_name):
        return list(self.collection.find({
            '$or': [
                {'day': day_name},
                {'day': 'all'},
                {'day': {'$in': ['everyday', 'daily']}},
                {'available': True}
            ]
        }))

    def get_items_by_category(self, category):
        sanitized_category = Sanitizer.sanitize_string(category)
        return list(self.collection.find({
            'category': {'$regex': f'^{sanitized_category}$', '$options': 'i'}
        }))

    def get_item_by_id(self, item_id):
        try:
            return self.collection.find_one({'_id': ObjectId(item_id)})
        except:
            return None

    def create_item(self, item_data):
        # Use centralized validation
        validation_result = MenuSchema.validate_menu_item(item_data)
        if not validation_result.is_valid:
            raise ValueError(f"Validation failed: {validation_result.errors}")

        # Sanitize inputs
        menu_item = {
            'name': Sanitizer.sanitize_string(item_data['name']),
            'category': Sanitizer.sanitize_string(item_data['category']),
            'price': float(item_data['price']),
            'description': Sanitizer.sanitize_string(item_data.get('description', '')),
            'ingredients': [Sanitizer.sanitize_string(ing) for ing in item_data.get('ingredients', [])],
            'day': Sanitizer.sanitize_string(item_data.get('day', 'all')).lower(),
            'available': bool(item_data.get('available', True)),
            'image_url': Sanitizer.sanitize_string(item_data.get('image_url', '')),
            'created_at': datetime.utcnow()
        }

        result = self.collection.insert_one(menu_item)
        return str(result.inserted_id)

    def update_item(self, item_id, update_data):
        # Validate price if provided
        if 'price' in update_data:
            try:
                update_data['price'] = float(update_data['price'])
                if update_data['price'] <= 0:
                    raise ValueError("Price must be positive")
            except (ValueError, TypeError):
                raise ValueError("Invalid price format")

        # Sanitize update fields
        sanitized_updates = {}
        for key, value in update_data.items():
            if isinstance(value, str):
                sanitized_updates[key] = Sanitizer.sanitize_string(value)
            elif isinstance(value, list):
                sanitized_updates[key] = [Sanitizer.sanitize_string(str(item)) for item in value]
            else:
                sanitized_updates[key] = value

        result = self.collection.update_one(
            {'_id': ObjectId(item_id)},
            {'$set': sanitized_updates}
        )
        return result.modified_count > 0

    def delete_item(self, item_id):
        result = self.collection.delete_one({'_id': ObjectId(item_id)})
        return result.deleted_count > 0