import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from pymongo import MongoClient

MONGO_URI = "mongodb+srv://hnjrwl_db_user:Honey12345@cluster0.w8sfktk.mongodb.net/freshbite_db?retryWrites=true&w=majority"
client = MongoClient(MONGO_URI)
db = client.freshbite_db

def check_admins():
    print("🔍 CHECKING ADMIN ACCOUNTS")
    print("=" * 50)
    
    # Check collections
    collections = db.list_collection_names()
    print(f"📋 Collections: {collections}")
    
    if 'admins' not in collections:
        print("❌ 'admins' collection not found!")
        return
    
    # Count admins
    count = db.admins.count_documents({})
    print(f"👥 Total admins: {count}")
    
    if count == 0:
        print("⚠️  No admin accounts found!")
        return
    
    # List all admins
    print("\n📊 ADMIN LIST:")
    print("-" * 40)
    
    admins = list(db.admins.find({}))
    
    for i, admin in enumerate(admins, 1):
        print(f"{i}. Email: {admin.get('email', 'N/A')}")
        print(f"   Name: {admin.get('full_name', 'N/A')}")
        print(f"   Role: {admin.get('role', 'admin')}")
        print(f"   Active: {admin.get('is_active', True)}")
        print(f"   Created: {admin.get('created_at', 'N/A')}")
        if 'password' in admin:
            pw = admin['password']
            if isinstance(pw, str) and len(pw) > 10:
                print(f"   Password: [HASHED: {pw[:20]}...]")
            else:
                print(f"   Password: {type(pw)}")
        print()

if __name__ == "__main__":
    check_admins()