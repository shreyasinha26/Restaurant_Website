# routes/contact_routes.py
from flask import Blueprint, request, jsonify
from datetime import datetime
from database.db import get_contact_collection
import uuid

contact_bp = Blueprint("contact_bp", __name__)

@contact_bp.route("/contact", methods=["POST"])
def contact():
    data = request.get_json() or {}

    required = ["name", "email", "subject", "message"]
    errors = [f"{f} is required" for f in required if not data.get(f)]

    if errors:
        return jsonify({"message": "Validation failed", "errors": errors}), 400

    message = {
        "_id": str(uuid.uuid4()),
        "name": data.get("name"),
        "email": data.get("email"),
        "phone": data.get("phone"),
        "subject": data.get("subject"),
        "message": data.get("message"),
        "created_at": datetime.utcnow()
    }

    get_contact_collection().insert_one(message)

    return jsonify({"message": "Message saved to MongoDB Atlas"}), 201
