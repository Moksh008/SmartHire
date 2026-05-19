import base64
import cv2
import numpy as np
import time
from uuid import uuid4
from datetime import datetime
from database import SessionLocal, SessionLog

def create_session():
    session_id = str(uuid4())
    db = SessionLocal()
    try:
        new_session = SessionLog(
            session_id=session_id,
            screener_data=None,
            integrity_logs=[],
            suspicion_score=0.0,
            start_time=datetime.utcnow()
        )
        db.add(new_session)
        db.commit()
    finally:
        db.close()
    return session_id

def get_session(session_id):
    db = SessionLocal()
    try:
        session = db.query(SessionLog).filter(SessionLog.session_id == session_id).first()
        if session:
            res = {
                "screener": session.screener_data,
                "integrity": session.integrity_logs,
                "suspicion_score": session.suspicion_score,
                "start_time": session.start_time.timestamp() if session.start_time else time.time()
            }
            if session.extra_data:
                res.update(session.extra_data)
            return res
        return None
    finally:
        db.close()

def update_session(session_id, key, value):
    db = SessionLocal()
    try:
        session = db.query(SessionLog).filter(SessionLog.session_id == session_id).first()
        if session:
            if key == "screener":
                session.screener_data = value
            elif key == "integrity":
                session.integrity_logs = value
            elif key == "suspicion_score":
                session.suspicion_score = value
            else:
                extra = dict(session.extra_data) if session.extra_data else {}
                extra[key] = value
                session.extra_data = extra
            db.commit()
    finally:
        db.close()

def decode_base64_frame(base64_str):
    """Decodes a base64 string into an OpenCV frame."""
    try:
        # Remove header if present (e.g., "data:image/jpeg;base64,")
        if "," in base64_str:
            base64_str = base64_str.split(",")[1]
        
        img_data = base64.b64decode(base64_str)
        nparr = np.frombuffer(img_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return frame
    except Exception as e:
        print(f"Error decoding frame: {e}")
        return None

def log_integrity_event(session_id, status, message, score_increment):
    db = SessionLocal()
    try:
        session = db.query(SessionLog).filter(SessionLog.session_id == session_id).first()
        if session:
            event = {
                "timestamp": time.strftime("%H:%M:%S"),
                "status": status,
                "message": message,
                "score_increment": score_increment
            }
            # SQLAlchemy JSON arrays require reassignment or flag_modified
            logs = list(session.integrity_logs) if session.integrity_logs else []
            logs.append(event)
            session.integrity_logs = logs
            session.suspicion_score = min(100.0, float(session.suspicion_score) + float(score_increment))
            db.commit()
            return event
        return None
    finally:
        db.close()
