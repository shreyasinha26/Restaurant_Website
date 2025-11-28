import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://hnjrwl_db_user:Honey12345@cluster0.w8sfktk.mongodb.net/?retryWrites=true&w=majority")
DB_NAME = os.getenv("DB_NAME", "freshbite_db")
JWT_SECRET = os.getenv("JWT_SECRET", "scrypt:32768:8:1$VG5CzAJ8CSdHUgss$c0e3e7ec84a0dbe131b8e643606d2a1b6f8aa5cfca1531e36c4cf32e2d58e18d69edad1d804b663118a51f2feb962a187820d0e1fecc1fb151bdbe4f66f71a47")