import requests
import json

def create_admin_account():
    print("\n=== CREATE ADMIN ACCOUNT ===")
    
    # Default admin account details
    admin_data = {
        "full_name": "System Administrator",
        "email": "admin@freshbite.com",
        "password": "Admin@123"
    }
    
    url = "http://127.0.0.1:5000/api/admin/signup"
    print(f"➡ Sending POST request to: {url}")
    
    try:
        response = requests.post(
            url,
            json=admin_data,
            headers={"Content-Type": "application/json"}
        )

        print(f"📡 Status Code: {response.status_code}")

        # Handle empty JSON responses safely
        try:
            resp_json = response.json()
        except ValueError:
            resp_json = "No JSON response"
        
        print(f"📨 Response Body: {resp_json}")

        # Success: account created
        if response.status_code == 201:
            print("\n✅ Admin account created successfully!")
            print("Use these credentials to log in:")
            print("   Email: admin@freshbite.com")
            print("   Password: Admin@123")

        # Admin already exists — not an error
        elif response.status_code == 400:
            print("\nℹ️ Admin account already exists.")
            print("You can log in using the same credentials.")

        else:
            print("\n❌ Failed to create admin account. Check backend logs.")

    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Could not connect to the backend.")
        print("Make sure your Flask server is running at:")
        print("➡ http://127.0.0.1:5000")

    except Exception as e:
        print(f"\n❌ Unexpected Error: {e}")


if __name__ == "__main__":
    create_admin_account()
