import bcrypt
from datetime import datetime
from bson import ObjectId
from validators.schemas import UserSchema
from validators.sanitizers import Sanitizer

class UserModel:
    def __init__(self, db):
        self.collection = db['users']

    def create_user(self, user_data):
        # Use centralized validation
        validation_result = UserSchema.validate_signup(user_data)
        if not validation_result.is_valid:
            raise ValueError(f"Validation failed: {validation_result.errors}")
        
        # Sanitize inputs
        email = Sanitizer.sanitize_email(user_data["email"])
        phone = Sanitizer.sanitize_phone(user_data.get("phone", ""))
        name = Sanitizer.sanitize_string(user_data["name"])
        address = Sanitizer.sanitize_string(user_data.get("address", ""))

        # Check for existing user
        if self.collection.find_one({"email": email}):
            raise ValueError("Email already exists")

        if phone and self.collection.find_one({"phone": phone}):
            raise ValueError("Phone already exists")

        # Hash password
        hashed_pw = bcrypt.hashpw(user_data["password"].encode("utf-8"), bcrypt.gensalt())

        user_doc = {
            "email": email,
            "password": hashed_pw.decode("utf-8"),
            "name": name.title(),
            "phone": phone,
            "address": address,
            "role": user_data.get("role", "customer"),
            "created_at": datetime.utcnow()
        }

        result = self.collection.insert_one(user_doc)
        return str(result.inserted_id)

    def find_user_by_email(self, email):
        sanitized_email = Sanitizer.sanitize_email(email)
        return self.collection.find_one({"email": sanitized_email})

    def find_user_by_id(self, user_id):
        try:
            return self.collection.find_one({"_id": ObjectId(user_id)})
        except:
            return None

    def find_user_by_phone(self, phone):
        sanitized_phone = Sanitizer.sanitize_phone(phone)
        return self.collection.find_one({"phone": sanitized_phone})

    def check_password(self, plain_password, hashed_password):
        """Check if plain password matches hashed password"""
        if isinstance(hashed_password, str):
            hashed_password = hashed_password.encode('utf-8')
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password)