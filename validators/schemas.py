import re

class ValidationResult:
    def __init__(self, is_valid=True, errors=None):
        self.is_valid = is_valid
        self.errors = errors or {}
    
    @classmethod
    def failure(cls, errors):
        return cls(False, errors)

class UserSchema:
    @staticmethod
    def validate_signup(data):
        errors = {}
        
        # Email validation
        email = data.get('email', '').strip().lower()
        if not email:
            errors['email'] = 'Email is required'
        elif not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', email):
            errors['email'] = 'Invalid email format'
        elif len(email) > 254:
            errors['email'] = 'Email is too long'
        
        # Password validation
        password = data.get('password', '')
        if not password:
            errors['password'] = 'Password is required'
        elif len(password) < 6:
            errors['password'] = 'Password must be at least 6 characters'
        elif len(password) > 128:
            errors['password'] = 'Password is too long'
        
        # Name validation
        name = data.get('name', '').strip()
        if not name:
            errors['name'] = 'Name is required'
        elif len(name) > 100:
            errors['name'] = 'Name must be less than 100 characters'
        
        # Phone validation
        phone = data.get('phone', '').strip()
        if phone:
            cleaned_phone = re.sub(r'[\s\-\(\)]', '', phone)
            if not re.match(r'^\+?[0-9]{10,15}$', cleaned_phone):
                errors['phone'] = 'Please enter a valid phone number'
        
        return ValidationResult(len(errors) == 0, errors)

    @staticmethod
    def validate_login(data):
        errors = {}
        
        email = data.get('email', '').strip()
        if not email:
            errors['email'] = 'Email is required'
            
        password = data.get('password', '')
        if not password:
            errors['password'] = 'Password is required'
            
        return ValidationResult(len(errors) == 0, errors)

class MenuSchema:
    @staticmethod
    def validate_menu_item(data):
        errors = {}
        
        # Name validation
        name = data.get('name', '').strip()
        if not name:
            errors['name'] = 'Name is required'
        elif len(name) > 100:
            errors['name'] = 'Name must be less than 100 characters'
        
        # Category validation
        category = data.get('category', '').strip()
        if not category:
            errors['category'] = 'Category is required'
        elif len(category) > 50:
            errors['category'] = 'Category must be less than 50 characters'
        
        # Price validation
        price = data.get('price')
        if price is None:
            errors['price'] = 'Price is required'
        else:
            try:
                price_val = float(price)
                if price_val <= 0:
                    errors['price'] = 'Price must be positive'
                elif price_val > 1000:
                    errors['price'] = 'Price must be reasonable'
            except (ValueError, TypeError):
                errors['price'] = 'Price must be a valid number'
        
        return ValidationResult(len(errors) == 0, errors)