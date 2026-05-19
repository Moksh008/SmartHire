import pytest
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Add backend directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from fastapi_app import app

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c
