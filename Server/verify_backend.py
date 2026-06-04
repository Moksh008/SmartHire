import time
from fastapi.testclient import TestClient
from fastapi_app import app

client = TestClient(app)

def run_tests():
    print("==========================================")
    print("RUNNING MODULAR BACKEND VERIFICATION...")
    print("==========================================")

    # Test 1: Health Check
    try:
        response = client.get("/api/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"
        assert response.json()["modular"] is True
        print("[PASS] Test 1: Health Check endpoint is fully functional and modular!")
    except Exception as e:
        print(f"[FAIL] Test 1: Health Check failed: {e}")
        return

    # Test 2: Auth Flows
    try:
        email = f"verify_user_{int(time.time())}@example.com"
        password = "password123"

        # Register
        reg_response = client.post("/api/auth/register", json={
            "email": email,
            "password": password,
            "role": "INDIVIDUAL"
        })
        assert reg_response.status_code == 200
        assert reg_response.json()["email"] == email
        print("[PASS] Test 2a: User Registration is working perfectly!")

        # Duplicate Register
        dup_response = client.post("/api/auth/register", json={
            "email": email,
            "password": password,
            "role": "INDIVIDUAL"
        })
        assert dup_response.status_code == 400
        print("[PASS] Test 2b: Duplicate registration prevention is working perfectly!")

        # Login
        login_response = client.post("/api/auth/login", json={
            "email": email,
            "password": password
        })
        assert login_response.status_code == 200
        assert "token" in login_response.json()
        print("[PASS] Test 2c: User Login is working perfectly!")
    except Exception as e:
        print(f"[FAIL] Test 2: Auth flow failed: {e}")
        return

    # Test 3: List Jobs
    try:
        jobs_response = client.get("/api/jobs?user_id=1")
        assert jobs_response.status_code == 200
        assert isinstance(jobs_response.json(), list)
        print("[PASS] Test 3: Job listing endpoint is working perfectly!")
    except Exception as e:
        print(f"[FAIL] Test 3: Job listing failed: {e}")
        return

    print("==========================================")
    print("ALL CORE BACKEND MODULE TESTS PASSED!")
    print("==========================================")

if __name__ == "__main__":
    run_tests()
