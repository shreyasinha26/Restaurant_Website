import sys
import os
import datetime
import bcrypt
from pymongo import MongoClient

# --------------------------------------------------
# Ensure script works no matter where it is executed
# --------------------------------------------------
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(CURRENT_DIR)

# --------------------------------------------------
# MongoDB connection (same as your application)
# --------------------------------------------------
MONGO_URI = "mongodb+srv://hnjrwl_db_user:Honey12345@cluster0.w8sfktk.mongodb.net/freshbite_db?retryWrites=true&w=majority"

try:
    client = MongoClient(MONGO_URI)
    db = client.freshbite_db
except Exception as e:
    print("❌ Failed to connect to MongoDB:", e)
    sys.exit(1)


def add_admins():
    """Adds predefined admin accounts safely."""

    admins_to_add = [
        {
            "full_name": "System Administrator",
            "email": "admin@freshbite.com",
            "password": "Admin@123",
            "role": "super_admin"
        },
        {
            "full_name": "Manager Admin",
            "email": "manager@freshbite.com",
            "password": "Manager@123",
            "role": "manager"
        },
        {
            "full_name": "Staff Admin",
            "email": "staff@freshbite.com",
            "password": "Staff@123",
            "role": "staff"
        },
        {
            "full_name": "Chef Admin",
            "email": "chef@freshbite.com",
            "password": "Chef@123",
            "role": "chef"
        }
    ]

    print("\n========================================")
    print("👥 Adding Admin Accounts to freshbite_db")
    print("========================================\n")

    for admin in admins_to_add:
        email = admin["email"]

        # Check if admin already exists
        existing_admin = db.admins.find_one({"email": email})
        if existing_admin:
            print(f"⚠️  SKIPPED: {email} already exists.")
            continue

        # Hash password securely
        hashed_password = bcrypt.hashpw(
            admin["password"].encode("utf-8"),
            bcrypt.gensalt()
        ).decode("utf-8")

        admin_doc = {
            "full_name": admin["full_name"],
            "email": email,
            "password": hashed_password,
            "role": admin["role"],
            "is_active": True,
            "created_at": datetime.datetime.utcnow(),
            "last_login": None
        }

        # Insert into DB
        result = db.admins.insert_one(admin_doc)

        print(f"✅ CREATED: {email}")
        print(f"   → Full Name: {admin['full_name']}")
        print(f"   → Role: {admin['role']}")
        print(f"   → Temp Password: {admin['password']}")
        print(f"   → Mongo ID: {result.inserted_id}\n")

    print("\n📊 CURRENT ADMIN ACCOUNTS:")
    all_admins = list(db.admins.find({}, {"password": 0}))  # Hide pass hash

    for index, admin in enumerate(all_admins, 1):
        print(f"{index}. {admin.get('email')} - {admin.get('full_name')} ({admin.get('role')})")

    print("\n🎉 DONE — Admin accounts ready for login!\n")


# --------------------------------------------------
# Script runner
# --------------------------------------------------
if __name__ == "__main__":
    print("========================================")
    print("     RUNNING ADMIN CREATION SCRIPT")
    print("========================================")
    add_admins()
