# Backend/routes/auth.py

from functools import wraps
from flask import request, jsonify
from database.db import get_admins_collection
from bson import ObjectId
import jwt
import datetime

# ----------------------------------------------------
# JWT Secret Key (Keep safe in environment variables!)
# ----------------------------------------------------
JWT_SECRET = (
    "scrypt:32768:8:1$VG5CzAJ8CSdHUgss$c0e3e7ec84a0dbe131b8e643606d2a1b6f8aa5cfca1531e36c4cf32e2d58e18d69edad1d804b663118a51f2feb962a187820d0e1fecc1fb151bdbe4f66f71a47"
)


# ----------------------------------------------------
# Generate JWT Token for Admin
# ----------------------------------------------------
def generate_token(admin_id):
    payload = {
        "admin_id": str(admin_id),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


# ----------------------------------------------------
# Verify JWT Token
# ----------------------------------------------------
def verify_token(token):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload.get("admin_id")
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None


# ----------------------------------------------------
# Admin Authentication Middleware
# ----------------------------------------------------
def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):

        # Get token from request headers
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"message": "Token is missing"}), 401

        # Strip "Bearer " prefix if present
        if token.startswith("Bearer "):
            token = token[7:]

        # Validate token
        admin_id = verify_token(token)
        if not admin_id:
            return jsonify({"message": "Invalid or expired token"}), 401

        # Verify admin exists in DB
        admin = get_admins_collection().find_one({"_id": ObjectId(admin_id)})
        if not admin:
            return jsonify({"message": "Admin not found"}), 401

        return f(*args, **kwargs)

    return decorated
