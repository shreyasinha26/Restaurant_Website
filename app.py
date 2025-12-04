import sys
import os
from flask import Flask, render_template
from pymongo import MongoClient
import json
from flask_cors import CORS

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)

def create_app():
    app = Flask(__name__)

    # -----------------------------
    # Flask Config
    # -----------------------------
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key-change-this-too'

    # -----------------------------
    # MongoDB Setup
    # -----------------------------
    MONGO_URI = os.environ.get("MONGO_URI") or \
        "mongodb+srv://hnjrwl_db_user:Honey12345@cluster0.w8sfktk.mongodb.net/freshbite_db?retryWrites=true&w=majority"

    MONGO_DBNAME = os.environ.get("MONGO_DBNAME") or "freshbite_db"

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
        return render_template("login.html")

    @app.route("/admin-dashboard")
    def admin_dashboard():
        return render_template("admin-dashboard.html")

    @app.route("/signup")
    def signup():
        return render_template("signup.html")

    @app.route("/find-us")
    def find_us():
        return render_template("find-us.html")

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
    print("\n>>> Flask backend running at http://localhost:5000\n")
    app.run(debug=True, port=5000)
