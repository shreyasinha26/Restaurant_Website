# Backend/routes/auth.py
from functools import wraps
from flask import request, jsonify
from database.db import get_admins_collection
import jwt
import datetime
from bson import ObjectId

# Secret key for JWT tokens
JWT_SECRET = "scrypt:32768:8:1$VG5CzAJ8CSdHUgss$c0e3e7ec84a0dbe131b8e643606d2a1b6f8aa5cfca1531e36c4cf32e2d58e18d69edad1d804b663118a51f2feb962a187820d0e1fecc1fb151bdbe4f66f71a47"

def generate_token(admin_id):
    payload = {
        'admin_id': str(admin_id),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

def verify_token(token):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return payload['admin_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({"message": "Token is missing"}), 401
        
        # Remove 'Bearer ' prefix if present
        if token.startswith('Bearer '):
            token = token[7:]
        
        admin_id = verify_token(token)
        if not admin_id:
            return jsonify({"message": "Invalid or expired token"}), 401
        
        # Verify admin exists in database
        collection = get_admins_collection()
        admin = collection.find_one({"_id": ObjectId(admin_id)})
        if not admin:
            return jsonify({"message": "Admin not found"}), 401
        
        return f(*args, **kwargs)
    return decorated_function