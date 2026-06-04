print("Importing sys, pathlib...")
import sys
from pathlib import Path
print("Importing requests, json...")
import requests
import json
print("Importing database...")
from database import init_db
print("Importing api_utils...")
from api_utils import create_session, get_session, update_session
print("Importing routers.interview...")
from routers.interview import get_adaptive_next, AdaptiveQuestionRequest
print("All imports completed successfully!")
