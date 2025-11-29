from flask import current_app
from mongoengine import Document, StringField, DateTimeField, signals
from mongoengine.errors import ValidationError
import bcrypt
import jwt
import datetime
import re

class User(Document):
    email = StringField(required=True, unique=True, max_length=100)
    password = StringField(required=True)
    name = StringField(required=True, min_length=2, max_length=50)
    phone = StringField(required=True, min_length=10, max_length=15)
    address = StringField(required=True, min_length=5, max_length=200)
    role = StringField(required=True, default='customer', choices=['customer', 'admin'])
    created_at = DateTimeField(default=datetime.datetime.utcnow)

    meta = {
        'collection': 'users',
        'indexes': ['email', 'phone']
    }

    # Custom validation methods
    def validate_email(self, value):
        if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', value):
            raise ValidationError('Invalid email format')
        return value

    def validate_phone(self, value):
        if not re.match(r'^\+?[0-9]{10,15}$', value):
            raise ValidationError('Phone number must be 10-15 digits, optionally starting with +')
        return value

    @staticmethod
    def validate_password(password):
        if len(password) < 6:
            raise ValidationError('Password must be at least 6 characters long')
        if len(password) > 100:
            raise ValidationError('Password must be less than 100 characters')
        return password

    def clean(self):
        """Custom document-level validation"""
        # Ensure email is lowercase
        if self.email:
            self.email = self.email.lower().strip()
        
        # Ensure name is properly formatted
        if self.name:
            self.name = self.name.strip().title()

    # JWT token methods
    def generate_token(self):
        payload = {
            'user_id': str(self.id),
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7),
            'iat': datetime.datetime.utcnow()
        }
        return jwt.encode(payload, current_app.config['JWT_SECRET_KEY'], algorithm='HS256')

    @staticmethod
    def verify_token(token):
        try:
            payload = jwt.decode(token, current_app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            return payload['user_id']
        except jwt.ExpiredSignatureError:
            raise ValidationError('Token has expired')
        except jwt.InvalidTokenError:
            raise ValidationError('Invalid token')

    @classmethod
    def authenticate_user(cls, email, password):
        try:
            user = cls.objects(email=email.lower()).first()
            if user and bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
                return user
            return None
        except Exception:
            return None

# Signal handler for password hashing
def hash_password(sender, document, **kwargs):
    """
    Automatically validates and hashes the password before saving.
    Only hashes if the password is not already hashed.
    """
    if document.password and not document.password.startswith('$2b$'):
        # Validate plain-text password
        User.validate_password(document.password)
        # Hash the password
        salt = bcrypt.gensalt()
        document.password = bcrypt.hashpw(document.password.encode('utf-8'), salt).decode('utf-8')

# Connect the signal to the User model
signals.pre_save.connect(hash_password, sender=User)