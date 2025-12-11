# routes/contact_routes.py

from flask import Blueprint, request, jsonify
from datetime import datetime
from database.db import get_contact_collection
import uuid

contact_bp = Blueprint("contact_bp", __name__)


# -------------------------------------------------------
# POST /contact → Save contact form submission to MongoDB
# -------------------------------------------------------
@contact_bp.route("/contact", methods=["POST"])
def contact():
    data = request.get_json() or {}

    # Required fields validation
    required_fields = ["name", "email", "subject", "message"]
    errors = [f"{field} is required" for field in required_fields if not data.get(field)]

    if errors:
        return jsonify({
            "message": "Validation failed",
            "errors": errors
        }), 400

    # Build message document
    message_doc = {
        "_id": str(uuid.uuid4()),
        "name": data.get("name"),
        "email": data.get("email"),
        "phone": data.get("phone"),
        "subject": data.get("subject"),
        "message": data.get("message"),
        "created_at": datetime.utcnow()
    }

    # Save to Mongo Atlas
    collection = get_contact_collection()
    collection.insert_one(message_doc)

    return jsonify({
        "message": "Message saved to MongoDB Atlas"
    }), 201
