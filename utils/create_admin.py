import requests
import json

def create_admin_account():
    print("=== CREATING ADMIN ACCOUNT ===")
    
    # Admin data - use the correct default credentials
    admin_data = {
        "full_name": "System Administrator",
        "email": "admin@freshbite.com",
        "password": "Admin@123"
    }
    
    try:
        print("Sending signup request...")
        response = requests.post(
            "http://127.0.0.1:5000/api/admin/signup",  # Changed to /api/admin/signup
            json=admin_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json() if response.content else 'No content'}")
        
        if response.status_code == 201:
            print("✅ Admin account created successfully!")
            print("You can now login with:")
            print("Email: admin@freshbite.com")
            print("Password: Admin@123")
        elif response.status_code == 400:
            print("ℹ️ Admin already exists (this is okay)")
            print("You can login with the existing account")
        else:
            print("❌ Failed to create admin account")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Make sure your Flask server is running on http://127.0.0.1:5000")

if __name__ == "__main__":
    create_admin_account()