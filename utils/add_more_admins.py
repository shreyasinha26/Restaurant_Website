import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from pymongo import MongoClient
import bcrypt
import datetime

# Connect to MongoDB
MONGO_URI = "mongodb+srv://hnjrwl_db_user:Honey12345@cluster0.w8sfktk.mongodb.net/freshbite_db?retryWrites=true&w=majority"
client = MongoClient(MONGO_URI)
db = client.freshbite_db

def add_admins():
    """Add multiple admin accounts"""
    
    # List of admins to add
    admins_to_add = [
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
    
    print("👥 Adding admin accounts...")
    
    for admin_data in admins_to_add:
        email = admin_data["email"]
        
        # Check if admin already exists
        existing = db.admins.find_one({"email": email})
        if existing:
            print(f"⚠️  {email} already exists, skipping...")
            continue
        
        # Hash password
        hashed_password = bcrypt.hashpw(
            admin_data["password"].encode('utf-8'), 
            bcrypt.gensalt()
        ).decode('utf-8')
        
        # Prepare admin document
        admin_doc = {
            "full_name": admin_data["full_name"],
            "email": email,
            "password": hashed_password,
            "role": admin_data["role"],
            "is_active": True,
            "created_at": datetime.datetime.utcnow(),
            "last_login": None
        }
        
        # Insert into database
        result = db.admins.insert_one(admin_doc)
        print(f"✅ Created {email} (ID: {result.inserted_id})")
        print(f"   Login: {email} / {admin_data['password']}")
    
    # Show all admins
    print("\n📊 ALL ADMIN ACCOUNTS:")
    all_admins = list(db.admins.find({}))
    for i, admin in enumerate(all_admins, 1):
        print(f"{i}. {admin['email']} - {admin['full_name']} ({admin.get('role', 'admin')})")

if __name__ == "__main__":
    print("=" * 50)
    print("ADD ADMIN ACCOUNTS")
    print("=" * 50)
    add_admins()
    print("\n✅ Done! You can now use these accounts to login.")