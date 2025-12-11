# routes/admin_routes.py

from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
from werkzeug.security import check_password_hash, generate_password_hash
from bson import ObjectId
import jwt

from database.db import get_admins_collection
from config import JWT_SECRET

admin_bp = Blueprint("admin_bp", __name__)


# ----------------------------------------------------
# JWT TOKEN GENERATION
# ----------------------------------------------------
def generate_token(admin_id):
    """Generate JWT token for admin authentication"""
    payload = {
        "admin_id": str(admin_id),
        "exp": datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


# ----------------------------------------------------
# ADMIN SIGNUP (Protected by Admin Key)
# ----------------------------------------------------
@admin_bp.route("/admin/signup", methods=["POST"])
def admin_signup():
    """
    Create a new admin account.
    Requires X-Admin-Key header for security.
    """
    try:
        data = request.get_json()
        print("Signup data received:", data)

        # Security layer
        SECRET_KEY = "FRESHBITE_ADMIN_2024"
        provided_key = request.headers.get("X-Admin-Key")

        print(f"[KEY CHECK] Provided={provided_key}, Expected={SECRET_KEY}")

        if provided_key != SECRET_KEY:
            print("❌ Unauthorized admin signup attempt")
            return jsonify({"message": "Unauthorized: Invalid admin key"}), 403

        # Validate payload
        if not data:
            return jsonify({"message": "No JSON data received"}), 400

        full_name = data.get("full_name")
        email = data.get("email")
        password = data.get("password")

        if not full_name or not email or not password:
            return jsonify({"message": "All fields are required"}), 400

        collection = get_admins_collection()

        # Prevent duplicate accounts
        if collection.find_one({"email": email}):
            return jsonify({"message": "Admin already exists"}), 400

        hashed_password = generate_password_hash(password)

        admin_doc = {
            "full_name": full_name,
            "email": email,
            "password": hashed_password,
            "created_at": datetime.utcnow()
        }

        result = collection.insert_one(admin_doc)
        print("Admin successfully created:", result.inserted_id)

        return jsonify({"message": "Admin created successfully!"}), 201

    except Exception as e:
        print("Signup error:", str(e))
        return jsonify({"message": "Server error during signup"}), 500


# ----------------------------------------------------
# ADMIN LOGIN
# ----------------------------------------------------
@admin_bp.route("/admin/login", methods=["POST"])
def admin_login():
    """
    Verify admin credentials and return JWT token.
    """
    try:
        data = request.get_json()
        print("Login data received:", data)

        if not data:
            return jsonify({"message": "No JSON data received"}), 400

        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return jsonify({"message": "Email and password required"}), 400

        collection = get_admins_collection()
        admin = collection.find_one({"email": email})
        print("Admin found:", bool(admin))

        if not admin:
            return jsonify({"message": "Admin not found"}), 401

        # Compare password hash
        if not check_password_hash(admin["password"], password):
            return jsonify({"message": "Invalid password"}), 401

        # Generate JWT
        token = generate_token(admin["_id"])

        return jsonify({
            "message": "Login successful",
            "token": token,
            "admin": {
                "id": str(admin["_id"]),
                "full_name": admin["full_name"],
                "email": admin["email"]
            }
        }), 200

    except Exception as e:
        print("Login error:", str(e))
        return jsonify({"message": "Server error during login"}), 500


# ----------------------------------------------------
# TEST ROUTE (Unprotected)
# ----------------------------------------------------
@admin_bp.route("/admin/test", methods=["GET"])
def admin_test():
    """Simple sanity check route"""
    return jsonify({"message": "Admin routes are working!"}), 200
