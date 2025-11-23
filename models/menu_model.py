from pymongo.collection import Collection
from typing import List, Dict, Any

class MenuModel:
    def __init__(self, collection: Collection):
        self.collection = collection

    def list_all(self) -> List[Dict[str, Any]]:
        items = list(self.collection.find())
        for i in items:
            i['id'] = str(i.get('_id'))
            i.pop('_id', None)
        return items

    def list_by_day(self, day_name: str) -> List[Dict[str, Any]]:
        items = list(self.collection.find({'day': day_name.lower()}))
        for i in items:
            i['id'] = str(i.get('_id'))
            i.pop('_id', None)
        return items

    def list_by_category(self, category: str) -> List[Dict[str, Any]]:
        items = list(self.collection.find({'category': category}))
        for i in items:
            i['id'] = str(i.get('_id'))
            i.pop('_id', None)
        return items

    def add_item(self, item: Dict[str, Any]) -> str:
        item.pop('id', None)
        result = self.collection.insert_one(item)
        return str(result.inserted_id)

    def seed_from_list(self, items: List[Dict[str, Any]]):
        # Insert only if collection is empty
        if self.collection.count_documents({}) == 0:
            self.collection.insert_many(items)
