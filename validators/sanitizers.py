import html

class Sanitizer:
    @staticmethod
    def sanitize_string(value):
        """Basic HTML escape sanitization"""
        if not value:
            return value
        return html.escape(str(value).strip())
    
    @staticmethod
    def sanitize_email(email):
        """Sanitize and normalize email"""
        if not email:
            return email
        return html.escape(email.strip().lower())
    
    @staticmethod
    def sanitize_phone(phone):
        """Sanitize phone number"""
        if not phone:
            return phone
        cleaned = ''.join(c for c in phone if c.isdigit() or c == '+')
        return html.escape(cleaned.strip())