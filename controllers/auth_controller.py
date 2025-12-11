from flask import request, jsonify, make_response, current_app
import jwt
from datetime import datetime, timedelta
from models.user_model import UserModel
from validators.schemas import UserSchema

class AuthController:
    def __init__(self):
        self._user_model = None

    @property
    def user_model(self):
        if self._user_model is None:
            self._user_model = UserModel(current_app.mongo_db)
        return self._user_model

    # -----------------------------
    # CUSTOMER SIGNUP (UNCHANGED)
    # -----------------------------
    def signup(self):
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "No data provided"}), 400

            validation_result = UserSchema.validate_signup(data)
            if not validation_result.is_valid:
                return jsonify({
                    "error": "Validation failed", 
                    "details": validation_result.errors
                }), 400

            user_id = self.user_model.create_user(data)
            
            return jsonify({
                "message": "User created successfully",
                "user_id": user_id
            }), 201

        except ValueError as ve:
            return jsonify({"error": str(ve)}), 400
        except Exception as e:
            return jsonify({"error": "Server error: " + str(e)}), 500

    # -----------------------------
    # CUSTOMER LOGIN (UNCHANGED)
    # -----------------------------
    def login(self):
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "No data provided"}), 400

            validation_result = UserSchema.validate_login(data)
            if not validation_result.is_valid:
                return jsonify({
                    "error": "Validation failed", 
                    "details": validation_result.errors
                }), 400

            email = data["email"].strip().lower()
            password = data["password"]

            user = self.user_model.find_user_by_email(email)
            if not user:
                return jsonify({"error": "Invalid email or password"}), 401

            if not self.user_model.check_password(password, user["password"]):
                return jsonify({"error": "Invalid email or password"}), 401

            token = self._generate_token(str(user["_id"]))

            response = make_response(jsonify({
                "message": "Login successful",
                "token": token,
                "user": self._user_to_dict(user)
            }))

            response.set_cookie(
                "auth_token",
                token,
                httponly=True,
                secure=False,
                samesite="Lax",
                max_age=7 * 24 * 60 * 60
            )

            return response, 200

        except Exception as e:
            return jsonify({"error": "Server error: " + str(e)}), 500

    # ------------------------------------------------
    # ⭐ ADMIN LOGIN (ADDED — ONLY NEW CODE HERE)
    # ------------------------------------------------
    def admin_login(self):
        try:
            data = request.get_json()
            if not data:
                return jsonify({"success": False, "message": "No data provided"}), 400

            email = data.get("email", "").strip().lower()
            password = data.get("password", "")

            # Fetch admin from users table
            admin = self.user_model.find_user_by_email(email)

            # Must be super_admin
            if not admin or admin.get("role") != "super_admin":
                return jsonify({"success": False, "message": "Admin not found"}), 401

            # Check password
            if not self.user_model.check_password(password, admin["password"]):
                return jsonify({"success": False, "message": "Invalid email or password"}), 401

            # Generate admin token
            token = self._generate_admin_token(str(admin["_id"]))

            return jsonify({
                "success": True,
                "token": token,
                "admin": {
                    "email": admin["email"],
                    "full_name": admin.get("name", "Admin User")
                },
                "redirect": "/app/admin-dashboard"
            }), 200

        except Exception as e:
            return jsonify({"success": False, "message": "Server error: " + str(e)}), 500

    # ------------------------------------------------
    # CUSTOMER LOGOUT (UNCHANGED)
    # ------------------------------------------------
    def logout(self):
        try:
            response = make_response(jsonify({"message": "Logout successful"}))
            response.set_cookie("auth_token", "", httponly=True, expires=0, max_age=0)
            return response, 200
        except Exception as e:
            return jsonify({"error": "Logout failed: " + str(e)}), 500

    # ------------------------------------------------
    # CUSTOMER CURRENT USER (UNCHANGED)
    # ------------------------------------------------
    def get_current_user(self):
        try:
            user_id = self._get_user_id_from_token()
            if not user_id:
                return jsonify({"error": "Token is missing or invalid"}), 401

            user = self.user_model.find_user_by_id(user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404

            return jsonify({
                "user": self._user_to_dict(user)
            }), 200

        except Exception as e:
            return jsonify({"error": "Server error: " + str(e)}), 500

    # ------------------------------------------------
    # EMAIL CHECK (UNCHANGED)
    # ------------------------------------------------
    def check_email(self, email):
        try:
            exists = self.user_model.find_user_by_email(email) is not None
            return jsonify({"exists": exists}), 200
        except Exception as e:
            return jsonify({"error": "Server error: " + str(e)}), 500

    # ------------------------------------------------
    # PHONE CHECK (UNCHANGED)
    # ------------------------------------------------
    def check_phone(self, phone):
        try:
            exists = self.user_model.find_user_by_phone(phone) is not None
            return jsonify({"exists": exists}), 200
        except Exception as e:
            return jsonify({"error": "Server error: " + str(e)}), 500

    # ------------------------------------------------
    # HELPER: CUSTOMER TOKEN (UNCHANGED)
    # ------------------------------------------------
    def _generate_token(self, user_id):
        payload = {
            "user_id": user_id,
            "exp": datetime.utcnow() + timedelta(days=7)
        }
        return jwt.encode(
            payload,
            current_app.config["JWT_SECRET_KEY"],
            algorithm="HS256"
        )

    # ------------------------------------------------
    # ⭐ HELPER: ADMIN TOKEN (ADDED)
    # ------------------------------------------------
    def _generate_admin_token(self, admin_id):
        payload = {
            "admin_id": admin_id,
            "exp": datetime.utcnow() + timedelta(days=7)
        }
        return jwt.encode(
            payload,
            current_app.config["JWT_SECRET_KEY"],
            algorithm="HS256"
        )


    # ------------------------------------------------
    # TOKEN DECODER (UNCHANGED)
    # ------------------------------------------------
    def _get_user_id_from_token(self):
        token = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
        else:
            token = request.cookies.get("auth_token")

        if not token:
            return None

        try:
            decoded = jwt.decode(
                token,
                current_app.config["JWT_SECRET_KEY"],
                algorithms=["HS256"]
            )
            return decoded.get("user_id")
        except:
            return None

    # ------------------------------------------------
    # USER STRUCT FORMATTER (UNCHANGED)
    # ------------------------------------------------
    def _user_to_dict(self, user):
        return {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user["name"],
            "phone": user.get("phone", ""),
            "address": user.get("address", ""),
            "role": user["role"]
        }
