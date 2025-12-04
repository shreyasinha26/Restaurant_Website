import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_server():
    print("Testing server connection...")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Server status: {response.status_code} - {response.json()}")
        return True
    except Exception as e:
        print(f"Server not running: {e}")
        return False

def create_admin():
    print("\nCreating admin account...")
    signup_data = {
        "full_name": "Restaurant Admin",
        "email": "admin@restaurant.com",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/admin/signup", json=signup_data)
        print(f"Signup response: {response.status_code} - {response.text}")
        return response.status_code == 201
    except Exception as e:
        print(f"Signup error: {e}")
        return False

def test_login():
    print("\nTesting login...")
    login_data = {
        "email": "admin@restaurant.com",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/admin/login", json=login_data)
        print(f"Login response: {response.status_code} - {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"Login error: {e}")
        return False

if __name__ == "__main__":
    print("=== RESTAURANT BACKEND SETUP TEST ===")
    
    if test_server():
        if create_admin():
            test_login()
    else:
        print("Please start the server first: python app.py")