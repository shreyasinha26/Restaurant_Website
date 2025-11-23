from flask import Blueprint, request, jsonify
from datetime import datetime
from bson import ObjectId
from database.db import get_reservations_collection

reservation_bp = Blueprint("reservation_bp", __name__)

def parse_date_time(date_str, time_str):
    try:
        return datetime.fromisoformat(f"{date_str}T{time_str}")
    except Exception:
        return None

# ---------- CREATE RESERVATION ----------
@reservation_bp.route("/reservations", methods=["POST"])
def create_reservation():
    data = request.get_json() or {}

    full_name = data.get("full_name", "").strip()
    email = data.get("email", "").strip()
    phone = data.get("phone", "").strip()
    guests = data.get("guests")
    date = data.get("date")      
    time = data.get("time")      
    notes = data.get("notes", "").strip()

    errors = []

    # Basic validation matching your front-end logic
    if not full_name:
        errors.append("Full name is required.")
    if not email:
        errors.append("Email is required.")
    if not phone or len(phone) != 10 or not phone.isdigit():
        errors.append("Phone must be exactly 10 digits.")
    if not guests:
        errors.append("Number of guests is required.")
    else:
        try:
            guests = int(guests)
            if guests < 1 or guests > 9:
                errors.append("Guests must be between 1 and 9.")
        except ValueError:
            errors.append("Guests must be a number.")

    if not date:
        errors.append("Reservation date is required.")
    if not time:
        errors.append("Reservation time is required.")

    dt = parse_date_time(date, time) if date and time else None
    if not dt:
        errors.append("Invalid date or time format.")

    if errors:
        return jsonify({"success": False, "errors": errors}), 400

    # Build reservation document
    now = datetime.utcnow()
    reservation = {
        "full_name": full_name,
        "email": email,
        "phone": phone,
        "guests": guests,
        "date_time": dt,
        "notes": notes,
        "status": "pending",     # pending / confirmed / seated / cancelled
        "created_at": now,
        "updated_at": now,
    }

    collection = get_reservations_collection()
    result = collection.insert_one(reservation)

    return jsonify({
        "success": True,
        "message": "Reservation created successfully.",
        "reservation_id": str(result.inserted_id)
    }), 201

# ---------- LIST RESERVATIONS (for admin) ----------
@reservation_bp.route("/reservations", methods=["GET"])
def list_reservations():
    """
    For now: return all reservations (later you can filter by date/status).
    """
    collection = get_reservations_collection()
    docs = collection.find().sort("date_time", 1)

    reservations = []
    for doc in docs:
        reservations.append({
            "id": str(doc["_id"]),
            "full_name": doc.get("full_name"),
            "email": doc.get("email"),
            "phone": doc.get("phone"),
            "guests": doc.get("guests"),
            "date_time": doc.get("date_time").isoformat() if doc.get("date_time") else None,
            "notes": doc.get("notes", ""),
            "status": doc.get("status", "pending"),
            "created_at": doc.get("created_at").isoformat() if doc.get("created_at") else None,
        })

    return jsonify({"success": True, "reservations": reservations}), 200
