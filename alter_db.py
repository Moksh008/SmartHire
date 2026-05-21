import sqlite3
from pathlib import Path

db_path = Path(__file__).parent / "pbl-test1" / "data" / "app.db"
if db_path.exists():
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE job_descriptions ADD COLUMN location VARCHAR;")
    except sqlite3.OperationalError:
        print("Column location already exists.")
    try:
        cursor.execute("ALTER TABLE job_descriptions ADD COLUMN department VARCHAR;")
    except sqlite3.OperationalError:
        print("Column department already exists.")
    try:
        cursor.execute("ALTER TABLE job_descriptions ADD COLUMN collaborators JSON;")
    except sqlite3.OperationalError:
        print("Column collaborators already exists.")
    conn.commit()
    conn.close()
    print("Database updated.")
else:
    print("DB not found at", db_path)
