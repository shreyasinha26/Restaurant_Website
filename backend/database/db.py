# db.py
from pymongo import MongoClient
from config import MONGO_URI, DB_NAME

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

def get_reservations_collection():
    return db["reservations"]

def get_contact_collection():
    return db["contact_messages"]

def get_admins_collection():
    return db["admin_login"]

