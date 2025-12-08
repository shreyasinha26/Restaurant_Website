from flask import Flask, jsonify
from flask_cors import CORS
from routes.admin_routes import admin_bp
from routes.reservation_routes import reservation_bp  
from routes.contact_routes import contact_bp          

app = Flask(__name__)
CORS(app)

# Register ALL blueprints
app.register_blueprint(admin_bp)
app.register_blueprint(reservation_bp)  
app.register_blueprint(contact_bp)      

@app.route('/')
def home():
    return jsonify({"message": "Restaurant API is running!"})

@app.route('/test')
def test():
    return jsonify({"message": "Test route working!"})

if __name__ == "__main__":
    print("Starting Flask server...")
    print("Available routes:")
    print("- GET  /")
    print("- GET  /test") 
    print("- POST /admin/signup")
    print("- POST /admin/login")
    print("- GET  /admin/test")
    print("- POST /reservations")        
    print("- GET  /admin/reservations")  
    print("- POST /contact")             
    app.run(debug=True, port=5001)