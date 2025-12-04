# database/db.py

from flask import current_app

def get_db():
    """Return the MongoDB database attached to the Flask app."""
    return current_app.mongo_db


def get_reservations_collection():
    return get_db()["reservations"]


def get_contact_collection():
    return get_db()["contact_messages"]


def get_admins_collection():
    return get_db()["admins"]
