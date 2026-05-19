from monitoring_system.detection.yolo import YOLODetector
from monitoring_system.detection.mediapipe_utils import FaceMonitor
from monitoring_system.detection.pose_analyzer import PoseAnalyzer
from monitoring_system.logic.rules import BehaviorEngine

# Global instances (lazy loaded)
yolo = None
face_monitor = None
pose_analyzer = None
rules = None

def get_detectors():
    global yolo, face_monitor, pose_analyzer, rules
    if yolo is None:
        yolo = YOLODetector()
        face_monitor = FaceMonitor()
        pose_analyzer = PoseAnalyzer()
        rules = BehaviorEngine()
    return yolo, face_monitor, pose_analyzer, rules
