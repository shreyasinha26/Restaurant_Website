import sys
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

from flask import Flask, render_template
from pymongo import MongoClient
import os, json

def create_app():
    app = Flask(__name__)

    # Add CORS headers manually
    @app.after_request
    def after_request(response):
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
        return response

    # HTML routes (same as before)
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

    # MongoDB setup
    # You can override via environment variable MONGO_URI and MONGO_DBNAME
    # Default: uses the credentials you provided earlier
    MONGO_URI = os.environ.get('MONGO_URI') or 'mongodb+srv://hnjrwl_db_user:Honey12345@cluster0.w8sfktk.mongodb.net/?appName=Cluster0'
    MONGO_DBNAME = os.environ.get('MONGO_DBNAME') or 'freshbite_db'

    client = MongoClient(MONGO_URI)
    db = client.get_database(MONGO_DBNAME)
    app.mongo_client = client
    app.mongo_db = db

    # Register Blueprints
    from routes.menu_routes import menu_bp
    app.register_blueprint(menu_bp)

    # Seed DB if empty using local JSON file
    try:
        col = db['menu_items']
        if col.count_documents({}) == 0:
            data_file = os.path.join(os.path.dirname(__file__), 'data', 'menu_items.json')
            if os.path.exists(data_file):
                with open(data_file, 'r') as f:
                    items = json.load(f)
                # normalize day fields
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
