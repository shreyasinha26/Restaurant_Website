# routes/auth_routes.py

from flask import Blueprint
from controllers.auth_controller import AuthController

# ----------------------------------------------------
# Blueprint Setup
# ----------------------------------------------------
auth_bp = Blueprint("auth", __name__)
auth_controller = AuthController()


# ----------------------------------------------------
# Authentication Routes
# ----------------------------------------------------
@auth_bp.route("/api/signup", methods=["POST"])
def signup():
    """User signup route"""
    return auth_controller.signup()


@auth_bp.route("/api/login", methods=["POST"])
def login():
    """User login route"""
    return auth_controller.login()


@auth_bp.route("/api/logout", methods=["POST"])
def logout():
    """Logout user and clear session token"""
    return auth_controller.logout()


@auth_bp.route("/api/current-user", methods=["GET"])
def get_current_user():
    """Returns currently authenticated user"""
    return auth_controller.get_current_user()


# ----------------------------------------------------
# Validation Routes (Email / Phone availability checks)
# ----------------------------------------------------
@auth_bp.route("/api/users/check/email/<email>", methods=["GET"])
def check_email(email):
    """Check if email is already registered"""
    return auth_controller.check_email(email)


@auth_bp.route("/api/users/check/phone/<phone>", methods=["GET"])
def check_phone(phone):
    """Check if phone number is already registered"""
    return auth_controller.check_phone(phone)
