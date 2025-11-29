import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    MONGO_URI = os.environ.get('MONGO_URI') or 'mongodb+srv://hnjrwl_db_user:Honey12345@cluster0.w8sfktk.mongodb.net/?appName=Cluster0'
    MONGO_DBNAME = os.environ.get('MONGO_DBNAME') or 'freshbite_db'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key-change-this-too'