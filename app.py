import sys
import os
from flask import Flask, render_template, request, jsonify, session, redirect
from pymongo import MongoClient
import json
from flask_cors import CORS
from functools import wraps
from bson.objectid import ObjectId
import jwt
import datetime
import bcrypt

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

def create_app():
    app = Flask(__name__)

    # -----------------------------
    # Flask Config
    # -----------------------------
    app.config['SECRET_KEY'] = 'freshbite-admin-secret-2024'
    app.config['JWT_SECRET_KEY'] = 'freshbite-jwt-secret-2024'

    # -----------------------------
    # MongoDB Setup
    # -----------------------------
    MONGO_URI = "mongodb+srv://hnjrwl_db_user:Honey12345@cluster0.w8sfktk.mongodb.net/freshbite_db?retryWrites=true&w=majority"
    MONGO_DBNAME = "freshbite_db"

    client = MongoClient(MONGO_URI)
    db = client.get_database(MONGO_DBNAME)

    # Attach DB to Flask app object
    app.mongo_client = client
    app.mongo_db = db

    # -----------------------------
    # CORS
    # -----------------------------
    CORS(app, supports_credentials=True, origins=["http://localhost:5000"])

    @app.after_request
    def after_request(response):
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:5000")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type,Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response

    # -----------------------------
    # SIMPLE AUTH FUNCTIONS
    # -----------------------------
    
    def generate_token(admin_id, email):
        """Generate JWT token"""
        payload = {
            'admin_id': str(admin_id),
            'email': email,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }
        token = jwt.encode(payload, app.config['JWT_SECRET_KEY'], algorithm='HS256')
        if isinstance(token, bytes):
            token = token.decode('utf-8')
        return token
    
    def verify_token(token):
        """Verify JWT token"""
        try:
            payload = jwt.decode(token, app.config['JWT_SECRET_KEY'], algorithms=['HS256'])
            return payload
        except:
            return None
    
    def is_authenticated():
        """Check if user is authenticated"""
        # Check session
        if session.get('admin_logged_in'):
            return True
        
        # Check Authorization header
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header[7:]
            if verify_token(token):
                return True
        
        # Check cookie
        if request.cookies.get('admin_token'):
            token = request.cookies.get('admin_token')
            if verify_token(token):
                return True
        
        return False
    
    def create_default_admin():
        """Create default admin if not exists"""
        try:
            if 'admins' not in db.list_collection_names():
                db.create_collection('admins')
            
            # Check if admin exists
            if db.admins.count_documents({'email': 'admin@freshbite.com'}) == 0:
                hashed_password = bcrypt.hashpw('Admin@123'.encode('utf-8'), bcrypt.gensalt())
                
                admin_data = {
                    'full_name': 'System Administrator',
                    'email': 'admin@freshbite.com',
                    'password': hashed_password.decode('utf-8'),
                    'role': 'super_admin',
                    'is_active': True,
                    'created_at': datetime.datetime.utcnow()
                }
                
                db.admins.insert_one(admin_data)
                print("✅ Default admin created: admin@freshbite.com / Admin@123")
            
            print("✅ Admin system ready")
            
        except Exception as e:
            print(f"⚠️ Could not create default admin: {e}")

    # Create default admin on startup
    create_default_admin()

    # -----------------------------
    # HTML Template Routes
    # -----------------------------
    @app.route("/")
    def home():
        return render_template("home.html")

    @app.route("/menu")
    def menu():
        return render_template("menu.html")

    @app.route("/reservation")
    def reservation():
        return render_template("reservation.html")

    @app.route("/contact")
    def contact():
        return render_template("contact.html")

    @app.route("/customer_login")
    def customer_login():
        return render_template("customer_login.html")

    @app.route("/customers_signup")
    def customers_signup():
        return render_template("customers_signup.html")

    @app.route("/customer_dashboard")
    def customer_dashboard():
        return render_template("customer_dashboard.html")

    @app.route("/login")
    def login():
        # If already logged in, redirect to dashboard
        if is_authenticated():
            return redirect('/admin-dashboard')
        return render_template("login.html")

    @app.route("/admin-dashboard")
    def admin_dashboard():
        """PROTECTED ROUTE - Only accessible if logged in"""
        if not is_authenticated():
            return redirect('/login')
        
        return render_template("admin-dashboard.html")

    @app.route("/signup")
    def signup():
        return render_template("signup.html")

    @app.route("/find-us")
    def find_us():
        return render_template("find-us.html")

    # -----------------------------
    # LOGIN API ENDPOINT
    # -----------------------------
    @app.route("/api/admin/login", methods=["POST"])
    def api_login():
        """Handle admin-login from frontend"""
        try:
            data = request.get_json()
            email = data.get('email', '').strip().lower()
            password = data.get('password', '')
            
            print(f"🔐 Login attempt: {email}")
            
            if not email or not password:
                return jsonify({
                    "success": False,
                    "message": "Email and password required"
                }), 400
            
            # Find admin in database
            admin = db.admins.find_one({'email': email, 'is_active': True})
            
            if not admin:
                return jsonify({
                    "success": False,
                    "message": "Invalid email or password"
                }), 401
            
            # Check password
            stored_password = admin.get('password', '')
            if not bcrypt.checkpw(password.encode('utf-8'), stored_password.encode('utf-8')):
                return jsonify({
                    "success": False,
                    "message": "Invalid email or password"
                }), 401
            
            # Generate token
            token = generate_token(admin['_id'], email)
            
            # Set session
            session['admin_logged_in'] = True
            session['admin_email'] = email
            session['admin_name'] = admin.get('full_name', 'Admin')
            session['admin_id'] = str(admin['_id'])
            
            # Update last login
            db.admins.update_one(
                {'_id': admin['_id']},
                {'$set': {'last_login': datetime.datetime.utcnow()}}
            )
            
            response = jsonify({
                "success": True,
                "message": "Login successful",
                "token": token,
                "admin": {
                    "email": email,
                    "full_name": admin.get('full_name', 'Admin'),
                    "role": admin.get('role', 'admin')
                },
                "redirect": "/admin-dashboard"
            })
            
            # Set cookies
            response.set_cookie('admin_logged_in', 'true', httponly=True, max_age=24*3600)
            response.set_cookie('admin_token', token, httponly=True, max_age=24*3600)
            
            print(f"✅ Admin Login successful: {email}")
            return response, 200
            
        except Exception as e:
            print(f"🔥 Admin Login error: {e}")
            return jsonify({
                "success": False,
                "message": "Server error during login"
            }), 500

# -----------------------------
# CUSTOMER LOGIN API ENDPOINT
# -----------------------------
    @app.route("/api/customer/login", methods=["POST"])
    def customer_login_api():
        """Handle customer login"""
        try:
            data = request.get_json()
            email = data.get('email', '').strip().lower()
            password = data.get('password', '')
            
            print(f"👤 Customer login attempt: {email}")
            
            if not email or not password:
                return jsonify({
                    "error": "Email and password required"
                }), 400
            
            # Find customer in users collection
            customer = db.users.find_one({'email': email})
            
            if not customer:
                print(f"❌ Customer not found: {email}")
                return jsonify({
                    "error": "Invalid email or password"
                }), 401
            
            # Check password
            stored_password = customer.get('password', '')
            
            # Handle password format (bytes/string)
            if isinstance(stored_password, bytes):
                stored_password = stored_password.decode('utf-8')
            
            if not bcrypt.checkpw(password.encode('utf-8'), stored_password.encode('utf-8')):
                return jsonify({
                    "error": "Invalid email or password"
                }), 401
            
            # Generate customer token
            payload = {
                'user_id': str(customer['_id']),
                'email': email,
                'role': 'customer',
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
            }
            token = jwt.encode(payload, app.config['JWT_SECRET_KEY'], algorithm='HS256')
            if isinstance(token, bytes):
                token = token.decode('utf-8')
            
            # Set session for customer
            session['customer_logged_in'] = True
            session['customer_email'] = email
            session['customer_name'] = customer.get('full_name', 'Customer')
            session['customer_id'] = str(customer['_id'])
            
            response = jsonify({
                "success": True,
                "token": token,
                "user": {
                    "email": email,
                    "full_name": customer.get('full_name', 'Customer'),
                    "phone": customer.get('phone', ''),
                    "role": 'customer'
                }
            })
            
            # Set customer cookies
            response.set_cookie('customer_token', token, httponly=True, max_age=24*3600)
            response.set_cookie('customer_email', email, httponly=True, max_age=24*3600)
            
            print(f"✅ Customer login successful: {email}")
            return response, 200
            
        except Exception as e:
            print(f"🔥 Customer login error: {e}")
            import traceback
            traceback.print_exc()
            return jsonify({
                "error": f"Login failed: {str(e)}"
            }), 500
        

#------------- LOGOUT AND AUTH CHECK API ENDPOINTS  -----------------
    @app.route("/api/logout", methods=["POST"])
    def api_logout():
        """Logout endpoint"""
        session.clear()
        response = jsonify({"success": True, "message": "Logged out"})
        response.delete_cookie('admin_logged_in')
        response.delete_cookie('admin_token')
        return response
    
    @app.route("/api/check-auth", methods=["GET"])
    def check_auth():
        """Check authentication status"""
        if is_authenticated():
            return jsonify({
                "authenticated": True,
                "admin": {
                    "email": session.get('admin_email', ''),
                    "name": session.get('admin_name', '')
                }
            })
        return jsonify({"authenticated": False}), 401

    # -----------------------------
    # SIMPLE MENU API (for dashboard)
    # -----------------------------
    @app.route("/api/menu/items", methods=["GET"])
    def get_menu_items():
        """Get menu items for dashboard"""
        if not is_authenticated():
            return jsonify({"error": "Unauthorized"}), 401
        
        try:
            items = list(db.menu_items.find({}))
            for item in items:
                item['_id'] = str(item['_id'])
            return jsonify(items), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    @app.route("/api/menu/stats", methods=["GET"])
    def get_menu_stats():
        """Get menu statistics"""
        if not is_authenticated():
            return jsonify({"error": "Unauthorized"}), 401
        
        try:
            total = db.menu_items.count_documents({})
            # Simple stats - you can customize this
            return jsonify({
                "total": total,
                "today": 5,  # Example
                "specials": 3  # Example
            }), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # -----------------------------
    # REGISTER ALL BLUEPRINTS
    # -----------------------------

    # Menu API
    from routes.menu_routes import menu_bp
    app.register_blueprint(menu_bp)

    # Auth API
    from routes.auth_routes import auth_bp
    app.register_blueprint(auth_bp)

    # Reservation API
    from routes.reservation_routes import reservation_bp
    app.register_blueprint(reservation_bp)

    # Contact API
    from routes.contact_routes import contact_bp
    app.register_blueprint(contact_bp)

    # Admin API
    from routes.admin_routes import admin_bp
    app.register_blueprint(admin_bp)

    # -----------------------------
    # SEED DATABASE IF EMPTY
    # -----------------------------
    try:
        col = db["menu_items"]
        if col.count_documents({}) == 0:
            data_file = os.path.join(os.path.dirname(__file__), "data", "menu_items.json")
            if os.path.exists(data_file):
                with open(data_file, "r") as f:
                    items = json.load(f)

                # normalize "day" fields
                for it in items:
                    if isinstance(it.get("day"), str):
                        it["day"] = it["day"].lower()

                col.insert_many(items)
                print("Seeded menu_items collection from data/menu_items.json")
    except Exception as exc:
        print("Warning: failed to seed menu items:", exc)

    return app


# -----------------------------
# RUN APPLICATION
# -----------------------------
if __name__ == "__main__":
    os.makedirs("data", exist_ok=True)
    app = create_app()
    print("\n" + "="*50)
    print("🚀 FreshBite Kitchen Backend")
    print("="*50)
    print("\n🌐 Server: http://localhost:5000")
    print("\n📋 Important URLs:")
    print("   • Login Page:        http://localhost:5000/login")
    print("   • Admin Dashboard:   http://localhost:5000/admin-dashboard")
    print("\n🔑 Default Admin Credentials:")
    print("   • Email:    admin@freshbite.com")
    print("   • Password: Admin@123")
    print("\n" + "="*50)
    app.run(debug=True, port=5000)