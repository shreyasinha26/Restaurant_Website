from flask import request, jsonify, make_response
from mongoengine.errors import ValidationError, DoesNotExist, NotUniqueError
from models.database import User
import re

class AuthController:
    @staticmethod
    def signup():
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({'error': 'No data provided'}), 400
            
            # Create user with validation
            user = User(
                email=data.get('email', '').strip(),
                password=data.get('password', ''),
                name=data.get('name', '').strip(),
                phone=data.get('phone', '').strip(),
                address=data.get('address', '').strip(),
                role='customer'
            )
            
            # This will trigger validation and password hashing via signals
            user.save()
            
            return jsonify({
                'message': 'User created successfully',
                'user_id': str(user.id)
            }), 201
            
        except ValidationError as e:
            errors = []
            if hasattr(e, 'to_dict'):
                error_dict = e.to_dict()
                for field, message in error_dict.items():
                    if field == '__all__':
                        errors.append(message)
                    else:
                        errors.append(f"{field}: {message}")
            else:
                errors.append(str(e))
            return jsonify({'error': 'Validation failed', 'details': errors}), 400
            
        except NotUniqueError as e:
            field = str(e).split('index: ')[1].split('_')[0] if 'index: ' in str(e) else 'field'
            return jsonify({'error': f'{field.capitalize()} already exists'}), 400
            
        except Exception as e:
            return jsonify({'error': 'Server error: ' + str(e)}), 500

    @staticmethod
    def login():
        try:
            data = request.get_json()
            
            if not data.get('email') or not data.get('password'):
                return jsonify({'error': 'Email and password are required'}), 400
            
            email = data['email'].strip().lower()
            password = data['password']
            
            user = User.authenticate_user(email, password)
            
            if user:
                token = user.generate_token()
                response = make_response(jsonify({
                    'message': 'Login successful',
                    'token': token,
                    'user': {
                        'id': str(user.id),
                        'email': user.email,
                        'name': user.name,
                        'phone': user.phone,
                        'address': user.address,
                        'role': user.role
                    }
                }))
                
                # Set HTTP-only cookie
                response.set_cookie(
                    'auth_token',
                    token,
                    httponly=True,
                    secure=False,
                    samesite='Lax',
                    max_age=7*24*60*60
                )
                
                return response, 200
            else:
                return jsonify({'error': 'Invalid email or password'}), 401
                
        except Exception as e:
            return jsonify({'error': 'Server error: ' + str(e)}), 500

    @staticmethod
    def logout():
        try:
            response = make_response(jsonify({'message': 'Logout successful'}))
            
            # Clear the auth cookie by setting it to empty and expired
            response.set_cookie(
                'auth_token',
                '',
                httponly=True,
                secure=False,
                samesite='Lax',
                expires=0,  # Set to past date to expire immediately
                max_age=0   # Set max_age to 0 to delete the cookie
            )
            
            return response, 200
            
        except Exception as e:
            return jsonify({'error': 'Logout failed: ' + str(e)}), 500

    @staticmethod
    def get_current_user():
        try:
            # Check for token in Authorization header
            auth_header = request.headers.get('Authorization')
            token = None
            
            if auth_header and auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
            else:
                # Check for token in cookie
                token = request.cookies.get('auth_token')
            
            if not token:
                return jsonify({'error': 'Token is missing'}), 401
            
            user_id = User.verify_token(token)
            user = User.objects(id=user_id).first()
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            return jsonify({
                'user': {
                    'id': str(user.id),
                    'email': user.email,
                    'name': user.name,
                    'phone': user.phone,
                    'address': user.address,
                    'role': user.role
                }
            }), 200
            
        except ValidationError as e:
            return jsonify({'error': 'Invalid token: ' + str(e)}), 401
        except Exception as e:
            return jsonify({'error': 'Server error: ' + str(e)}), 500

    @staticmethod
    def check_email(email):
        try:
            exists = User.objects(email=email.lower()).first() is not None
            return jsonify({'exists': exists}), 200
        except Exception as e:
            return jsonify({'error': 'Server error: ' + str(e)}), 500

    @staticmethod
    def check_phone(phone):
        try:
            exists = User.objects(phone=phone).first() is not None
            return jsonify({'exists': exists}), 200
        except Exception as e:
            return jsonify({'error': 'Server error: ' + str(e)}), 500