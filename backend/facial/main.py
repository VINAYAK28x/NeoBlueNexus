import sys
import json
import logging
import cv2
import numpy as np
from enhanced_liveness import EnhancedLivenessDetector
from arcface_embedding import get_face_embedding

# Configure logging to write to stderr
logging.basicConfig(stream=sys.stderr, level=logging.INFO)
logger = logging.getLogger(__name__)

def run_liveliness_and_extract_vector(video_path):
    try:
        # Initialize the enhanced liveness detector
        detector = EnhancedLivenessDetector()
        
        # Open the video file
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return {
                "is_live": False,
                "live_face_vector": None,
                "error": "Could not open video file"
            }

        # Variables to track liveness detection
        blink_detected = False
        movement_detected = False
        quality_good = True # Initialize as True, will be set to False if any frame fails quality
        live_face_vector = None
        detection_details = {
            "blink_detected": False,
            "movement_detected": False,
            "quality_good": False,
            "frames_processed": 0
        }

        # Process video frames
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            detection_details["frames_processed"] += 1

            # Run liveness detection
            result = detector.detect_liveness(frame)
            
            # Update detection status
            if result["is_blinking"]:
                blink_detected = True
                detection_details["blink_detected"] = True
            
            if result["is_moving"]:
                movement_detected = True
                detection_details["movement_detected"] = True
            
            # Update overall quality_good status: it must be good for ALL frames
            if not result["is_quality_good"]:
                quality_good = False
            detection_details["quality_good"] = quality_good

            # If we have all required checks, extract face vector
            if blink_detected and movement_detected and quality_good and live_face_vector is None:
                live_face_vector = get_face_embedding(frame)
                if live_face_vector is not None:
                    live_face_vector = live_face_vector.tolist()

            # If we have all required checks, we can stop processing
            if blink_detected and movement_detected and quality_good and live_face_vector is not None:
                break

        cap.release()

        # Determine overall liveness
        is_live = blink_detected and movement_detected and quality_good and live_face_vector is not None

        return {
            "is_live": is_live,
            "live_face_vector": live_face_vector,
            "detection_details": detection_details
        }

    except Exception as e:
        logger.error(f"Error in run_liveliness_and_extract_vector: {str(e)}")
        return {
            "is_live": False,
            "live_face_vector": None,
            "error": str(e)
        }

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Please provide video path"}))
        sys.exit(1)
    
    video_path = sys.argv[1]
    result = run_liveliness_and_extract_vector(video_path)
    # Ensure we only print the JSON result to stdout
    print(json.dumps(result))