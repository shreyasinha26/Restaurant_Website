from datetime import datetime

def get_menu(model):
    return model.list_all()

def get_todays_menu(model):
    today = datetime.now().strftime('%A').lower()
    return model.list_by_day(today)

def get_menu_by_category(model, category: str):
    return model.list_by_category(category)

def add_menu_item(model, item_data: dict):
    # minimal validation
    if not item_data.get('name') or 'price' not in item_data:
        raise ValueError('Menu item must contain at least name and price.')
    inserted_id = model.add_item(item_data)
    return inserted_id
