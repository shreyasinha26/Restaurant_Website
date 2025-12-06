import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'

    MONGO_URI = os.environ.get('MONGO_URI') or \
        'mongodb+srv://hnjrwl_db_user:Honey12345@cluster0.w8sfktk.mongodb.net/freshbite_db?retryWrites=true&w=majority'

    MONGO_DBNAME = os.environ.get('MONGO_DBNAME') or 'freshbite_db'

    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or \
        'scrypt:32768:8:1$VG5CzAJ8CSdHUgss$c0e3e7ec84a0dbe131b8e643606d2a1b6f8aa5cfca1531e36c4cf32e2d58e18d69edad1d804b663118a51f2feb962a187820d0e1fecc1fb151bdbe4f66f71a47'

# ------------------------------
# BACKWARD COMPATIBILITY EXPORTS
# ------------------------------

# Old route imports
JWT_SECRET = Config.JWT_SECRET_KEY
MONGO_URI = Config.MONGO_URI
DB_NAME = Config.MONGO_DBNAME
