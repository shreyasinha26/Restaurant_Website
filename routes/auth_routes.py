from flask import Blueprint
from controllers.auth_controller import AuthController

auth_bp = Blueprint('auth', __name__)

auth_controller = AuthController()

@auth_bp.route('/api/signup', methods=['POST'])
def signup():
    return auth_controller.signup()

@auth_bp.route('/api/login', methods=['POST'])
def login():
    return auth_controller.login()

@auth_bp.route('/api/logout', methods=['POST'])
def logout():
    return auth_controller.logout()

@auth_bp.route('/api/current-user', methods=['GET'])
def get_current_user():
    return auth_controller.get_current_user()

@auth_bp.route('/api/users/check/email/<email>', methods=['GET'])
def check_email(email):
    return auth_controller.check_email(email)

@auth_bp.route('/api/users/check/phone/<phone>', methods=['GET'])
def check_phone(phone):
    return auth_controller.check_phone(phone)