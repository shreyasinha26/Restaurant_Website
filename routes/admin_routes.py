from flask import Blueprint, request, jsonify
from database.db import get_admins_collection
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime, timedelta
import jwt
from bson import ObjectId
from config import JWT_SECRET

admin_bp = Blueprint("admin_bp", __name__)

def generate_token(admin_id):
    payload = {
        'admin_id': str(admin_id),
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

# ADMIN SIGNUP - CREATE FIRST ADMIN
@admin_bp.route("/admin/signup", methods=["POST"])
def admin_signup():
    try:
        data = request.get_json()
        print("Signup data received:", data)
        
        # Secret key protection
        SECRET_KEY = "FRESHBITE_ADMIN_2024"
        provided_key = request.headers.get('X-Admin-Key')
        
        print(f"Secret key check - Provided: {provided_key}, Expected: {SECRET_KEY}")
        
        if provided_key != SECRET_KEY:
            print("❌ UNAUTHORIZED: Invalid admin key!")
            return jsonify({"message": "Unauthorized: Invalid admin key"}), 403
        
        if not data:
            return jsonify({"message": "No JSON data received"}), 400
            
        full_name = data.get("full_name")
        email = data.get("email")
        password = data.get("password")

        if not full_name or not email or not password:
            return jsonify({"message": "All fields are required"}), 400

        collection = get_admins_collection()

        # Check if admin exists
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
        print("Admin created with ID:", result.inserted_id)
        
        return jsonify({"message": "Admin created successfully!"}), 201
        
    except Exception as e:
        print("Signup error:", str(e))
        return jsonify({"message": "Server error during signup"}), 500

# ADMIN LOGIN - ADD THIS FUNCTION
@admin_bp.route("/admin/login", methods=["POST"])
def admin_login():
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

        print("Admin found in DB:", admin is not None)

        if not admin:
            return jsonify({"message": "Admin not found"}), 401

        # Check password
        if not check_password_hash(admin["password"], password):
            return jsonify({"message": "Invalid password"}), 401

        # Generate token
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

# TEST PROTECTED ROUTE
@admin_bp.route("/admin/test", methods=["GET"])
def admin_test():
    return jsonify({"message": "Admin routes are working!"}), 200