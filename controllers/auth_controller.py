from flask import request, jsonify, make_response, current_app
import jwt
from datetime import datetime, timedelta
from models.user_model import UserModel
from validators.schemas import UserSchema

class AuthController:
    def __init__(self):
        # Don't initialize model here, do it in methods
        self._user_model = None

    @property
    def user_model(self):
        if self._user_model is None:
            self._user_model = UserModel(current_app.mongo_db)
        return self._user_model

    def signup(self):
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "No data provided"}), 400

            # Centralized validation
            validation_result = UserSchema.validate_signup(data)
            if not validation_result.is_valid:
                return jsonify({
                    "error": "Validation failed", 
                    "details": validation_result.errors
                }), 400

            # Create user using model
            user_id = self.user_model.create_user(data)
            
            return jsonify({
                "message": "User created successfully",
                "user_id": user_id
            }), 201

        except ValueError as ve:
            return jsonify({"error": str(ve)}), 400
        except Exception as e:
            return jsonify({"error": "Server error: " + str(e)}), 500

    def login(self):
        try:
            data = request.get_json()
            if not data:
                return jsonify({"error": "No data provided"}), 400

            # Centralized validation
            validation_result = UserSchema.validate_login(data)
            if not validation_result.is_valid:
                return jsonify({
                    "error": "Validation failed", 
                    "details": validation_result.errors
                }), 400

            email = data["email"].strip().lower()
            password = data["password"]

            # Find user using model
            user = self.user_model.find_user_by_email(email)
            
            if not user:
                return jsonify({"error": "Invalid email or password"}), 401

            # Check password using model
            if not self.user_model.check_password(password, user["password"]):
                return jsonify({"error": "Invalid email or password"}), 401

            # Generate JWT token
            token = self._generate_token(str(user["_id"]))

            response = make_response(jsonify({
                "message": "Login successful",
                "token": token,
                "user": self._user_to_dict(user)
            }))

            # Set cookie
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

    def logout(self):
        try:
            response = make_response(jsonify({"message": "Logout successful"}))
            response.set_cookie("auth_token", "", httponly=True, expires=0, max_age=0)
            return response, 200
        except Exception as e:
            return jsonify({"error": "Logout failed: " + str(e)}), 500

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

    def check_email(self, email):
        try:
            exists = self.user_model.find_user_by_email(email) is not None
            return jsonify({"exists": exists}), 200
        except Exception as e:
            return jsonify({"error": "Server error: " + str(e)}), 500

    def check_phone(self, phone):
        try:
            exists = self.user_model.find_user_by_phone(phone) is not None
            return jsonify({"exists": exists}), 200
        except Exception as e:
            return jsonify({"error": "Server error: " + str(e)}), 500

    # Helper methods
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
            return decoded["user_id"]
        except:
            return None

    def _user_to_dict(self, user):
        return {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user["name"],
            "phone": user.get("phone", ""),
            "address": user.get("address", ""),
            "role": user["role"]
        }