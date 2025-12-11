import sys
import os
from pymongo import MongoClient

# --------------------------------------------------
# Ensure script works correctly regardless of location
# --------------------------------------------------
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(CURRENT_DIR)

# --------------------------------------------------
# MongoDB connection
# --------------------------------------------------
MONGO_URI = (
    "mongodb+srv://hnjrwl_db_user:Honey12345@cluster0.w8sfktk.mongodb.net/"
    "freshbite_db?retryWrites=true&w=majority"
)

try:
    client = MongoClient(MONGO_URI)
    db = client.freshbite_db
except Exception as e:
    print("❌ ERROR: Could not connect to MongoDB.")
    print("Reason:", e)
    sys.exit(1)


def check_admins():
    print("\n🔍 CHECKING ADMIN ACCOUNTS")
    print("=" * 60)

    # Check all collections first
    try:
        collections = db.list_collection_names()
        print(f"📋 Collections in DB: {collections}")
    except Exception as e:
        print("❌ ERROR: Could not list collections.")
        print("Reason:", e)
        return

    if "admins" not in collections:
        print("❌ ERROR: 'admins' collection does NOT exist.")
        return

    # Count admin documents
    try:
        count = db.admins.count_documents({})
    except Exception as e:
        print("❌ ERROR while counting admins:", e)
        return

    print(f"👥 Total admins found: {count}")

    if count == 0:
        print("⚠️  No admin accounts found!")
        return

    # List all admins
    print("\n📊 ADMIN ACCOUNT LIST")
    print("-" * 60)

    try:
        admins = list(db.admins.find({}))
    except Exception as e:
        print("❌ ERROR: Could not fetch admin documents.")
        print("Reason:", e)
        return

    for i, admin in enumerate(admins, 1):
        print(f"{i}. Email: {admin.get('email', 'N/A')}")
        print(f"   Name: {admin.get('full_name', 'N/A')}")
        print(f"   Role: {admin.get('role', 'admin')}")
        print(f"   Active: {admin.get('is_active', True)}")
        print(f"   Created At: {admin.get('created_at', 'N/A')}")

        # Show hashed password format (safe output)
        pw = admin.get("password", None)
        if pw:
            pw_str = str(pw)
            if len(pw_str) > 15:
                print(f"   Password: [HASHED: {pw_str[:20]}...]")
            else:
                print(f"   Password: {pw_str}")
        else:
            print("   Password: None stored?")

        print()  # empty line after each admin


# --------------------------------------------------
# Script runner
# --------------------------------------------------
if __name__ == "__main__":
    check_admins()
