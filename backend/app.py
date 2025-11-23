from flask import Flask
from flask_cors import CORS

from routes.reservation_routes import reservation_bp
from routes.contact_routes import contact_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(reservation_bp)
app.register_blueprint(contact_bp)

if __name__ == "__main__":
    app.run(debug=True)
