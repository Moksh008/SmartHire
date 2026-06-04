import requests
import json

def test_auth():
    print("==================================================")
    print(">>> VERIFYING AUTHENTICATION & LOGIN CORE ENDPOINTS")
    print("==================================================")

    base_url = "http://127.0.0.1:8000/api/auth"
    user_url = "http://127.0.0.1:8000/api/user"

    # 1. Test Register
    reg_payload = {
        "email": "testcandidate@demo.ai",
        "password": "candidatepass",
        "role": "INDIVIDUAL"
    }
    
    print("\n[TEST 1] Registering a new candidate...")
    try:
        resp = requests.post(f"{base_url}/register", json=reg_payload)
        print("  - Response Status:", resp.status_code)
        if resp.status_code in [200, 201]:
            data = resp.json()
            print("  - Registered successfully!")
            print("  - Returned User Data:", data)
            user_id = data.get("id")
        elif resp.status_code == 400 and "already registered" in resp.text:
            print("  - Candidate already registered (Safe validation). Querying login next...")
        else:
            print("  - Registration failed:", resp.text)
    except Exception as e:
        print(f"  - Request failed: {e}")

    # 2. Test Login
    login_payload = {
        "email": "testcandidate@demo.ai",
        "password": "candidatepass"
    }
    print("\n[TEST 2] Executing dynamic login attempt...")
    try:
        resp = requests.post(f"{base_url}/login", json=login_payload)
        print("  - Response Status:", resp.status_code)
        if resp.status_code == 200:
            data = resp.json()
            print("  - Logged in successfully!")
            print("  - Returned Auth Token:", data.get("token"))
            print("  - Returned Role:", data.get("role"))
            user_id = data.get("id")
        else:
            print("  - Login failed:", resp.text)
    except Exception as e:
        print(f"  - Request failed: {e}")

    # 3. Test Profile Update
    if 'user_id' in locals():
        print(f"\n[TEST 3] Updating Candidate Profile for User ID: {user_id}...")
        profile_payload = {
            "full_name": "Test Candidate Expert",
            "bio": "Senior AI Assessment Architect",
            "location": "Silicon Valley",
            "skills": ["Python", "FastAPI", "React", "Docker"]
        }
        try:
            resp = requests.put(f"{user_url}/profile", json=profile_payload, params={"user_id": user_id})
            print("  - Response Status:", resp.status_code)
            if resp.status_code == 200:
                print("  - Profile updated successfully!")
                print("  - Updated Fields:", resp.json().get("user"))
            else:
                print("  - Profile update failed:", resp.text)
        except Exception as e:
            print(f"  - Request failed: {e}")

    print("\n==================================================")
    print(">>> AUTHENTICATION VERIFICATION CONCLUDED.")
    print("==================================================")

if __name__ == "__main__":
    test_auth()
