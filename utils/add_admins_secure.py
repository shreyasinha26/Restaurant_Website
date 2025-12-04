import requests
import json

BASE_URL = "http://127.0.0.1:5000"
SECRET_KEY = "FRESHBITE_ADMIN_2024"

def test_server():
    print("Testing server connection...")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"✅ Server status: {response.status_code} - {response.json()}")
        return True
    except Exception as e:
        print(f"❌ Server not running: {e}")
        return False

def create_secure_admin(full_name, email, password):
    print(f"\n🔄 Creating admin: {email}")
    
    admin_data = {
        "full_name": full_name,
        "email": email,
        "password": password
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/admin/signup",
            json=admin_data,
            headers={
                "X-Admin-Key": SECRET_KEY,
                "Content-Type": "application/json"
            }
        )
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 201:
            print(f"✅ ADMIN CREATED: {email}")
            return True
        elif response.status_code == 400:
            print(f"ℹ️ Admin already exists: {email}")
            return True
        else:
            print(f"❌ Failed to create: {email}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_admin_login(email, password):
    print(f"\n🔐 Testing login for: {email}")
    
    login_data = {
        "email": email,
        "password": password
    }
    
    try:
        # FIXED URL - added /admin/login
        response = requests.post(f"{BASE_URL}/admin/login", json=login_data)
        
        print(f"Login Status: {response.status_code}")
        
        if response.status_code == 200:
            print(f"✅ LOGIN SUCCESSFUL: {email}")
            result = response.json()
            print(f"Admin: {result.get('admin', {}).get('full_name')}")
            return True
        else:
            print(f"❌ LOGIN FAILED: {email}")
            if response.status_code == 401:
                print("Invalid email or password")
            return False
            
    except Exception as e:
        print(f"❌ Login error: {e}")
        return False

if __name__ == "__main__":
    print("=== 🛡️ SECURE ADMIN CREATION ===")
    print(f"Using secret key: {SECRET_KEY}")
    
    if not test_server():
        print("Please start the server first: python app.py")
        exit()
    
    # List of admins you want to create
    admins_to_create = [
        {
            "full_name": "Manager Admin",
            "email": "manager@restaurant.com",
            "password": "manager123"
        },
        {
            "full_name": "Staff Admin", 
            "email": "staff@restaurant.com",
            "password": "staff123"
        }
    ]
    
    success_count = 0
    
    # Create all admins
    for admin in admins_to_create:
        if create_secure_admin(admin["full_name"], admin["email"], admin["password"]):
            if test_admin_login(admin["email"], admin["password"]):
                success_count += 1
        print("-" * 50)
    
    print(f"\n🎯 Results: {success_count}/{len(admins_to_create)} admins created and tested successfully!")