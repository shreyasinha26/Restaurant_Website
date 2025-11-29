
from flask import Blueprint
from controllers.auth_controller import AuthController

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/signup', methods=['POST'])
def signup():
    return AuthController.signup()

@auth_bp.route('/api/login', methods=['POST'])
def login():
    return AuthController.login()

@auth_bp.route('/api/logout', methods=['POST'])
def logout():
    return AuthController.logout()

@auth_bp.route('/api/current-user', methods=['GET'])
def get_current_user():
    return AuthController.get_current_user()

@auth_bp.route('/api/users/check/email/<email>', methods=['GET'])
def check_email(email):
    return AuthController.check_email(email)

@auth_bp.route('/api/users/check/phone/<phone>', methods=['GET'])
def check_phone(phone):
    return AuthController.check_phone(phone)