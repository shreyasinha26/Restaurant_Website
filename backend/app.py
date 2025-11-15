from flask import Flask
from flask_cors import CORS
from routes.reservation_routes import reservation_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(reservation_bp)

if __name__ == "__main__":
    app.run(debug=True)

