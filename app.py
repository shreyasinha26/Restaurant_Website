import sys
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from flask import Flask, render_template
from pymongo import MongoClient
import json
from flask_cors import CORS

def create_app():
    app = Flask(__name__)

    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key-change-this-too'

    # MongoDB setup (PyMongo Only)
    MONGO_URI = (
        os.environ.get('MONGO_URI')
        or 'mongodb+srv://hnjrwl_db_user:Honey12345@cluster0.w8sfktk.mongodb.net/freshbite_db?retryWrites=true&w=majority'
    )
    MONGO_DBNAME = os.environ.get('MONGO_DBNAME') or 'freshbite_db'

    # PyMongo connection
    client = MongoClient(MONGO_URI)
    db = client.get_database(MONGO_DBNAME)

    app.mongo_client = client
    app.mongo_db = db

    # CORS Setup
    CORS(app, supports_credentials=True, origins=['http://localhost:5000'])

    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5000')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    # HTML Routes
    @app.route('/')
    def home():
        return render_template('home.html')

    @app.route('/menu')
    def menu():
        return render_template('menu.html')

    @app.route('/reservation')
    def reservation():
        return render_template('reservation.html')

    @app.route('/contact')
    def contact():
        return render_template('contact.html')

    @app.route('/customer_login')
    def customer_login():
        return render_template('customer_login.html')

    @app.route('/customers_signup')
    def customers_signup():
        return render_template('customers_signup.html')

    @app.route('/customer_dashboard')
    def customer_dashboard():
        return render_template('customer_dashboard.html')

    @app.route('/login')
    def login():
        return render_template('login.html')

    @app.route('/admin-dashboard')
    def admin_dashboard():
        return render_template('admin-dashboard.html')

    @app.route('/signup')
    def signup():
        return render_template('signup.html')

    @app.route('/find-us')
    def findus():
        return render_template('find-us.html')

    # Register Blueprints
    from routes.menu_routes import menu_bp
    app.register_blueprint(menu_bp)

    from routes.auth_routes import auth_bp
    app.register_blueprint(auth_bp)

    # Seed DB if empty (PyMongo)
    try:
        col = db['menu_items']
        if col.count_documents({}) == 0:
            data_file = os.path.join(os.path.dirname(__file__), 'data', 'menu_items.json')
            if os.path.exists(data_file):
                with open(data_file, 'r') as f:
                    items = json.load(f)

                # Normalize day fields
                for it in items:
                    if 'day' in it and isinstance(it['day'], str):
                        it['day'] = it['day'].lower()

                col.insert_many(items)
                print('Seeded menu_items collection from data/menu_items.json')
    except Exception as e:
        print('Warning: failed to seed database:', e)

    return app

if __name__ == '__main__':
    os.makedirs('data', exist_ok=True)
    app = create_app()
    app.run(debug=True, port=5000)