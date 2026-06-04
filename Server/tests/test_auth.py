import pytest
import time

def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["modular"] is True

def test_auth_flow(client):
    email = f"test_user_{int(time.time())}@example.com"
    password = "password123"
    
    # 1. Register
    reg_response = client.post("/api/auth/register", json={
        "email": email,
        "password": password,
        "role": "INDIVIDUAL"
    })
    assert reg_response.status_code == 200
    assert reg_response.json()["email"] == email

    # 2. Duplicate registration should fail
    dup_response = client.post("/api/auth/register", json={
        "email": email,
        "password": password,
        "role": "INDIVIDUAL"
    })
    assert dup_response.status_code == 400

    # 3. Login
    login_response = client.post("/api/auth/login", json={
        "email": email,
        "password": password
    })
    assert login_response.status_code == 200
    assert "token" in login_response.json()
