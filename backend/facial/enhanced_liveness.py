import cv2
import mediapipe as mp
import numpy as np
from insightface.app import FaceAnalysis
import json
import logging
import sys
from skimage.feature import local_binary_pattern
from scipy.fftpack import fft2, fftshift
from deepface import DeepFace
from typing import Tuple, Dict, Any

# Configure logging
logging.basicConfig(stream=sys.stderr, level=logging.INFO)
logger = logging.getLogger(__name__)

def convert_to_serializable(obj):
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, np.integer):
        return int(obj)
    elif isinstance(obj, np.floating):
        return float(obj)
    elif isinstance(obj, dict):
        return {key: convert_to_serializable(value) for key, value in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [convert_to_serializable(item) for item in obj]
    return obj

# MediaPipe face mesh setup
mp_face_mesh = mp.solutions.face_mesh
LEFT_EYE = [362, 385, 387, 263, 373, 380]
RIGHT_EYE = [33, 160, 158, 133, 153, 144]

class EnhancedLivenessDetector:
    def __init__(self):
        # Initialize MediaPipe Face Mesh
        self.face_mesh = mp_face_mesh.FaceMesh(
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        )
        
        # Initialize ArcFace
        logger.info("Initializing ArcFace...")
        self.face_analyzer = FaceAnalysis(name='buffalo_l')
        self.face_analyzer.prepare(ctx_id=0, det_size=(640, 640))
        logger.info("ArcFace initialized successfully")
        
        # Initialize InsightFace anti-spoofing
        logger.info("Initializing InsightFace anti-spoofing...")
        try:
            self.spoof_app = FaceAnalysis(name='antispoofing')
            self.spoof_app.prepare(ctx_id=0, det_size=(640, 640))
            logger.info("InsightFace anti-spoofing initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize InsightFace anti-spoofing: {e}")
            self.spoof_app = None
        
        # Eye landmarks indices
        self.LEFT_EYE = [362, 385, 387, 263, 373, 380]
        self.RIGHT_EYE = [33, 160, 158, 133, 153, 144]
        
        # Mouth landmarks indices
        self.MOUTH = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95, 78, 191, 80, 81, 82]
        
        # Adjusted thresholds
        self.SKIN_REFLECTANCE_THRESHOLD = 0.4  # Lowered from 0.6 for better real user acceptance
        self.EAR_THRESHOLD = 0.22  # Decreased from 0.25 to be more strict
        self.MOUTH_MOVEMENT_THRESHOLD = 0.02  # Increased from 0.01 to require more significant mouth movement
        self.MIN_BLINK_COUNT = 2  # Require at least 2 blinks
        self.MIN_MOUTH_MOVEMENTS = 2  # Require at least 2 mouth movements
        self.MIN_SKIN_REFLECTANCE_FRAMES = 5  # Require consistent skin reflectance
        self.MIN_FACE_ANGLE_CHANGE = 5.0  # Minimum face angle change in degrees
        self.MAX_FACE_DISTANCE = 0.3  # Maximum normalized face distance from center
        self.MIN_FACE_SIZE = 0.08  # Lowered from 0.2 to 0.08 for better real user acceptance
        self.blink_threshold = 0.22
        self.spoof_threshold = 0.7  # Increased threshold to be more lenient
        self.movement_threshold = 0.02  # Reduced threshold for more lenient movement detection
        self.cumulative_movement_threshold = 0.1  # New threshold for total movement
        self.prev_landmarks = None
        self.movement_detected = False
        self.quality_threshold = 0.5  # Threshold for face quality check
        self.frame_count = 0
        self.movement_history = []  # Track movement over time
        self.cumulative_movement = 0.0  # Track total movement

    def get_eye_aspect_ratio(self, landmarks, eye_indices, image_w, image_h) -> float:
        """Calculate the eye aspect ratio for blink detection."""
        points = [(int(landmarks[i].x * image_w), int(landmarks[i].y * image_h)) for i in eye_indices]
        vertical_1 = abs(points[1][1] - points[5][1])
        vertical_2 = abs(points[2][1] - points[4][1])
        horizontal = abs(points[0][0] - points[3][0])
        return (vertical_1 + vertical_2) / (2.0 * horizontal)

    def get_mouth_aspect_ratio(self, landmarks):
        # MediaPipe landmarks for inner mouth: 13, 14, 15, 16 (top lip) and 78, 81, 87, 191 (bottom lip)
        # Outer corners of the mouth: 61 (left), 291 (right)
        
        # Vertical distances: average of distances between upper and lower inner lip landmarks
        dist_v1 = np.linalg.norm(np.array([landmarks.landmark[13].x, landmarks.landmark[13].y]) - np.array([landmarks.landmark[78].x, landmarks.landmark[78].y]))
        dist_v2 = np.linalg.norm(np.array([landmarks.landmark[14].x, landmarks.landmark[14].y]) - np.array([landmarks.landmark[81].x, landmarks.landmark[81].y]))
        dist_v3 = np.linalg.norm(np.array([landmarks.landmark[15].x, landmarks.landmark[15].y]) - np.array([landmarks.landmark[87].x, landmarks.landmark[87].y]))
        dist_v4 = np.linalg.norm(np.array([landmarks.landmark[16].x, landmarks.landmark[16].y]) - np.array([landmarks.landmark[191].x, landmarks.landmark[191].y]))
        vertical_dist_avg = (dist_v1 + dist_v2 + dist_v3 + dist_v4) / 4.0

        # Horizontal distance: distance between mouth corners
        dist_h = np.linalg.norm(np.array([landmarks.landmark[61].x, landmarks.landmark[61].y]) - np.array([landmarks.landmark[291].x, landmarks.landmark[291].y]))

        if dist_h == 0:
            return 0  # Avoid division by zero
        
        mar = vertical_dist_avg / dist_h
        return mar

    def analyze_skin_reflectance(self, frame, face_landmarks):
        h, w = frame.shape[:2]
        # Get face region
        x_min = w
        x_max = 0
        y_min = h
        y_max = 0
        
        for landmark in face_landmarks.landmark:
            x, y = int(landmark.x * w), int(landmark.y * h)
            x_min = min(x_min, x)
            x_max = max(x_max, x)
            y_min = min(y_min, y)
            y_max = max(y_max, y)
        
        # Add padding
        padding = 20
        x_min = max(0, x_min - padding)
        x_max = min(w, x_max + padding)
        y_min = max(0, y_min - padding)
        y_max = min(h, y_max + padding)
        
        # Extract face region
        face_region = frame[y_min:y_max, x_min:x_max]
        
        # Convert to HSV for better skin detection
        hsv = cv2.cvtColor(face_region, cv2.COLOR_BGR2HSV)
        
        # Define skin color range - widened range for better detection
        lower_skin = np.array([0, 15, 50], dtype=np.uint8)
        upper_skin = np.array([25, 255, 255], dtype=np.uint8)
        
        # Create skin mask
        skin_mask = cv2.inRange(hsv, lower_skin, upper_skin)
        
        # Calculate skin reflectance
        skin_pixels = np.sum(skin_mask > 0)
        total_pixels = skin_mask.size
        reflectance_ratio = skin_pixels / total_pixels
        logger.info(f"Skin reflectance ratio: {reflectance_ratio:.4f} (threshold: {self.SKIN_REFLECTANCE_THRESHOLD})")
        
        return reflectance_ratio > self.SKIN_REFLECTANCE_THRESHOLD

    def detect_mouth_movement(self, landmarks, prev_landmarks):
        if prev_landmarks is None:
            return False
            
        current_mar = self.get_mouth_aspect_ratio(landmarks)
        prev_mar = self.get_mouth_aspect_ratio(prev_landmarks)
        
        logger.info(f"  MAR: Current={current_mar:.4f}, Previous={prev_mar:.4f}, Diff={abs(current_mar - prev_mar):.4f}")
        
        # Check if mouth openness changed significantly
        return abs(current_mar - prev_mar) > self.MOUTH_MOVEMENT_THRESHOLD

    def get_face_angle(self, landmarks):
        # Calculate face angle using nose bridge and chin landmarks
        nose_bridge = np.array([landmarks.landmark[1].x, landmarks.landmark[1].y])
        chin = np.array([landmarks.landmark[152].x, landmarks.landmark[152].y])
        angle = np.degrees(np.arctan2(chin[1] - nose_bridge[1], chin[0] - nose_bridge[0]))
        return angle

    def get_face_distance(self, landmarks, frame_width, frame_height):
        # Calculate face distance from center of frame
        face_center = np.array([0.0, 0.0], dtype=np.float64)  # Initialize as float64
        for landmark in landmarks.landmark:
            face_center += np.array([landmark.x, landmark.y], dtype=np.float64)
        face_center /= len(landmarks.landmark)
        
        frame_center = np.array([0.5, 0.5], dtype=np.float64)
        distance = np.linalg.norm(face_center - frame_center)
        return float(distance)  # Convert to Python float for JSON serialization

    def get_face_size(self, landmarks, frame_width, frame_height):
        # Calculate face size relative to frame
        x_coords = np.array([landmark.x for landmark in landmarks.landmark], dtype=np.float64)
        y_coords = np.array([landmark.y for landmark in landmarks.landmark], dtype=np.float64)
        width = float(np.max(x_coords) - np.min(x_coords))
        height = float(np.max(y_coords) - np.min(y_coords))
        return width * height

    def detect_screen_artifacts(self, frame):
        # Convert to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        # FFT to detect repetitive patterns (moiré)
        f = fft2(gray)
        fshift = fftshift(f)
        magnitude_spectrum = 20 * np.log(np.abs(fshift) + 1)
        h, w = magnitude_spectrum.shape
        center = (h // 2, w // 2)
        ring = magnitude_spectrum[center[0]-30:center[0]+30, center[1]-30:center[1]+30]
        outer = magnitude_spectrum[center[0]-100:center[0]+100, center[1]-100:center[1]+100]
        ring_mean = np.mean(ring)
        outer_mean = np.mean(outer)
        moire_value = outer_mean - ring_mean
        moire_detected = moire_value > 5  # Lowered from 10
        if moire_detected:
            logger.info('Screen artifact: Moiré pattern detected!')

        # Glare detection: look for very bright spots
        glare = np.sum(gray > 240) / (gray.shape[0] * gray.shape[1])
        glare_detected = glare > 0.005  # Lowered from 0.01
        if glare_detected:
            logger.info('Screen artifact: Glare detected!')

        # Edge detection for screen borders
        edges = cv2.Canny(gray, 100, 200)
        lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=200, minLineLength=100, maxLineGap=10)
        edge_count = len(lines) if lines is not None else 0
        edge_detected = edge_count > 5  # Lowered from 10
        if edge_detected:
            logger.info('Screen artifact: Long straight edges detected!')

        # Log the actual values for tuning
        logger.info(f"Screen artifact values: moire={moire_value:.2f}, glare={glare:.4f}, edge_count={edge_count}")

        # Return True if any artifact is detected
        return moire_detected or glare_detected or edge_detected

    def analyze_skin_texture(self, frame, face_landmarks):
        # Extract face region
        h, w = frame.shape[:2]
        x_min = w
        x_max = 0
        y_min = h
        y_max = 0
        for landmark in face_landmarks.landmark:
            x, y = int(landmark.x * w), int(landmark.y * h)
            x_min = min(x_min, x)
            x_max = max(x_max, x)
            y_min = min(y_min, y)
            y_max = max(y_max, y)
        padding = 10
        x_min = max(0, x_min - padding)
        x_max = min(w, x_max + padding)
        y_min = max(0, y_min - padding)
        y_max = min(h, y_max + padding)
        face_region = frame[y_min:y_max, x_min:x_max]
        if face_region.size == 0:
            return False
        gray_face = cv2.cvtColor(face_region, cv2.COLOR_BGR2GRAY)
        # Compute LBP
        lbp = local_binary_pattern(gray_face, P=8, R=1, method='uniform')
        (hist, _) = np.histogram(lbp.ravel(), bins=np.arange(0, 11), range=(0, 10))
        hist = hist.astype('float')
        hist /= (hist.sum() + 1e-6)
        # Real skin has a more uniform LBP histogram, screens/photos are more peaky
        uniformity = np.std(hist)
        # Threshold: if too peaky, likely not real skin
        return uniformity < 0.12

    def detect_spoofing(self, frame):
        if self.spoof_app is None:
            return None
        faces = self.spoof_app.get(frame)
        if not faces:
            return None  # No face detected
        # Return the spoofing score for the largest face
        return faces[0]['spoofing']  # 1: real, 0: spoof

    def detect_blink(self, frame: np.ndarray) -> bool:
        """Detect if the person in the frame is blinking."""
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_frame)
        
        if results.multi_face_landmarks:
            for face_landmarks in results.multi_face_landmarks:
                h, w = frame.shape[:2]
                left_ear = self.get_eye_aspect_ratio(face_landmarks.landmark, LEFT_EYE, w, h)
                right_ear = self.get_eye_aspect_ratio(face_landmarks.landmark, RIGHT_EYE, w, h)
                ear = (left_ear + right_ear) / 2.0
                if ear < self.blink_threshold:
                    logger.info(f"Blink detected - EAR: {ear:.4f}")
                    return True
        return False

    def check_face_movement(self, landmarks) -> bool:
        """Check if there is significant face movement between frames."""
        if self.prev_landmarks is None:
            self.prev_landmarks = landmarks
            return False

        # Calculate average movement of key facial points
        movement = 0
        for i in range(len(landmarks)):
            dx = landmarks[i].x - self.prev_landmarks[i].x
            dy = landmarks[i].y - self.prev_landmarks[i].y
            movement += np.sqrt(dx*dx + dy*dy)

        movement /= len(landmarks)
        self.prev_landmarks = landmarks
        
        # Update cumulative movement
        self.cumulative_movement += movement
        
        # Store movement in history
        self.movement_history.append(movement)
        if len(self.movement_history) > 10:  # Keep last 10 frames
            self.movement_history.pop(0)
        
        # Calculate average movement over recent frames
        avg_movement = np.mean(self.movement_history)
        
        # Log movement information
        logger.info(f"Frame {self.frame_count}: Movement: {movement:.6f}, Avg: {avg_movement:.6f}, Cumulative: {self.cumulative_movement:.6f}")

        # Consider movement detected if any of these conditions are met:
        # 1. Current movement exceeds threshold
        # 2. Average movement exceeds threshold
        # 3. Cumulative movement exceeds threshold
        if (movement > self.movement_threshold or 
            avg_movement > self.movement_threshold or 
            self.cumulative_movement > self.cumulative_movement_threshold):
            self.movement_detected = True
            logger.info(f"Movement detected - Current: {movement:.6f}, Avg: {avg_movement:.6f}, Cumulative: {self.cumulative_movement:.6f}")
            return True
            
        return False

    def check_face_quality(self, frame: np.ndarray) -> bool:
        """Check face image quality using basic metrics."""
        try:
            # Convert to grayscale
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            
            # Check brightness
            brightness = np.mean(gray)
            if brightness < 40 or brightness > 220:
                logger.info(f"Quality check failed - Brightness: {brightness:.2f}")
                return False

            # Check contrast
            contrast = np.std(gray)
            if contrast < 20:
                logger.info(f"Quality check failed - Contrast: {contrast:.2f}")
                return False

            # Check blur
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            if laplacian_var < 100:
                logger.info(f"Quality check failed - Blur: {laplacian_var:.2f}")
                return False

            logger.info(f"Quality check passed - Brightness: {brightness:.2f}, Contrast: {contrast:.2f}, Blur: {laplacian_var:.2f}")
            return True
        except Exception as e:
            logger.error(f"Error in face quality check: {str(e)}")
            return False

    def detect_liveness(self, frame: np.ndarray) -> Dict[str, Any]:
        """
        Perform comprehensive liveness detection combining multiple checks.
        
        Args:
            frame: Input image frame (numpy array)
            
        Returns:
            Dictionary containing liveness detection results
        """
        self.frame_count += 1
        
        # Check for blinking
        is_blinking = self.detect_blink(frame)
        
        # Check face quality
        is_quality_good = self.check_face_quality(frame)
        
        # Check face movement
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_frame)
        is_moving = False
        
        if results.multi_face_landmarks:
            for face_landmarks in results.multi_face_landmarks:
                is_moving = self.check_face_movement(face_landmarks.landmark)
                break
        
        # Combine results - consider it live if we have both blink and movement
        is_live = is_blinking and (is_moving or self.movement_detected) and is_quality_good
        
        # Log overall status
        logger.info(f"Frame {self.frame_count} - Blink: {is_blinking}, Movement: {is_moving or self.movement_detected}, Quality: {is_quality_good}, Live: {is_live}")
        
        return {
            'is_live': is_live,
            'is_blinking': is_blinking,
            'is_moving': is_moving or self.movement_detected,
            'is_quality_good': is_quality_good,
            'movement_detected': self.movement_detected,
            'cumulative_movement': self.cumulative_movement
        }

    def process_frame(self, frame, prev_landmarks=None):
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = self.face_mesh.process(rgb_frame)
        
        if not results.multi_face_landmarks:
            return {
                "is_live": False,
                "face_detected": False,
                "blink_detected": False,
                "mouth_movement": False,
                "skin_reflectance": False,
                "face_vector": None,
                "face_angle": None,
                "face_distance": None,
                "face_size": None,
                "screen_artifact": False,
                "skin_texture": False,
                "spoofing_score": None
            }
        
        face_landmarks = results.multi_face_landmarks[0]
        h, w = frame.shape[:2]
        
        # Calculate face metrics
        face_angle = self.get_face_angle(face_landmarks)
        face_distance = self.get_face_distance(face_landmarks, w, h)
        face_size = self.get_face_size(face_landmarks, w, h)
        
        # Check for blink
        left_ear = self.get_eye_aspect_ratio(face_landmarks.landmark, self.LEFT_EYE, w, h)
        right_ear = self.get_eye_aspect_ratio(face_landmarks.landmark, self.RIGHT_EYE, w, h)
        ear = (left_ear + right_ear) / 2.0
        blink_detected = ear < self.EAR_THRESHOLD
        logger.info(f"Frame {frame.shape[0]}x{frame.shape[1]}: EAR={ear:.4f}, Blink Detected: {blink_detected}")
        
        # Check skin reflectance
        skin_reflectance_ok = self.analyze_skin_reflectance(frame, face_landmarks)
        logger.info(f"Frame {frame.shape[0]}x{frame.shape[1]}: Skin Reflectance OK: {skin_reflectance_ok}")
        
        # Check mouth movement
        mouth_movement = False
        if prev_landmarks:
            mouth_movement = self.detect_mouth_movement(face_landmarks, prev_landmarks)
            logger.info(f"Frame {frame.shape[0]}x{frame.shape[1]}: Mouth Movement Detected: {mouth_movement}")
        else:
            logger.info(f"Frame {frame.shape[0]}x{frame.shape[1]}: No previous landmarks for mouth movement detection.")

        # Screen artifact detection
        screen_artifact = self.detect_screen_artifacts(frame)
        # Skin texture analysis
        skin_texture = self.analyze_skin_texture(frame, face_landmarks)
        # Anti-spoofing detection
        spoofing_score = self.detect_spoofing(frame)
        logger.info(f"Spoofing score: {spoofing_score}")

        # Get face embedding using ArcFace
        face_vector = None
        try:
            faces = self.face_analyzer.get(frame)
            if len(faces) > 0:
                face_vector = faces[0].embedding.tolist()
                logger.info(f"Frame {frame.shape[0]}x{frame.shape[1]}: Face vector extracted.")
        except Exception as e:
            logger.error(f"Error getting face embedding: {e}")

        # If spoofing is detected, set is_live to False for this frame
        is_live_frame = blink_detected and skin_reflectance_ok and mouth_movement and not screen_artifact and skin_texture
        if spoofing_score == 0:
            logger.info("InsightFace anti-spoofing: Spoof detected! Setting is_live to False for this frame.")
            is_live_frame = False

        return {
            "is_live": is_live_frame,
            "face_detected": True,
            "blink_detected": blink_detected,
            "mouth_movement": mouth_movement,
            "skin_reflectance": skin_reflectance_ok,
            "face_vector": face_vector,
            "face_angle": face_angle,
            "face_distance": face_distance,
            "face_size": face_size,
            "screen_artifact": screen_artifact,
            "skin_texture": skin_texture,
            "spoofing_score": spoofing_score
        }

    def process_video(self, video_path):
        logger.info(f"Processing video: {video_path}")
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            logger.error("Could not open video file")
            return {
                "success": False,
                "error": "Could not open video file"
            }
        
        prev_landmarks = None
        liveness_detected = False
        live_face_vector = None
        frame_count = 0
        max_frames = 120
        
        # Counters for liveness actions
        blink_count = 0
        mouth_movement_count = 0
        skin_reflectance_frames = 0
        consecutive_skin_frames = 0
        prev_skin_state = False
        
        # Face movement tracking
        prev_face_angle = None
        angle_changes = []
        face_distances = []
        face_sizes = []
        
        # Flags for liveness actions
        has_blinked_overall = False
        has_moved_mouth_overall = False
        has_good_skin_reflectance_overall = False
        has_face_movement = False

        processed_frame_count = 0
        target_sampled_frames = 30
        frame_skip_interval = max_frames // target_sampled_frames
        if frame_skip_interval == 0: frame_skip_interval = 1

        screen_artifact_frames = 0
        bad_texture_frames = 0

        while cap.isOpened() and frame_count < max_frames and processed_frame_count < target_sampled_frames:
            ret, frame = cap.read()
            if not ret:
                break
            
            if frame_count % frame_skip_interval == 0:
                current_frame_results = self.process_frame(frame, prev_landmarks)
                
                if current_frame_results["face_detected"]:
                    # Update counters
                    if current_frame_results["blink_detected"]:
                        blink_count += 1
                        has_blinked_overall = True
                    
                    if current_frame_results["mouth_movement"]:
                        mouth_movement_count += 1
                        has_moved_mouth_overall = True
                    
                    # Track consecutive skin reflectance frames
                    if current_frame_results["skin_reflectance"]:
                        if prev_skin_state:
                            consecutive_skin_frames += 1
                        else:
                            consecutive_skin_frames = 1
                        skin_reflectance_frames += 1
                        has_good_skin_reflectance_overall = True
                    else:
                        consecutive_skin_frames = 0
                    
                    prev_skin_state = current_frame_results["skin_reflectance"]
                    
                    # Track face movement
                    if prev_face_angle is not None:
                        angle_change = abs(current_frame_results["face_angle"] - prev_face_angle)
                        angle_changes.append(angle_change)
                        if angle_change > self.MIN_FACE_ANGLE_CHANGE:
                            has_face_movement = True
                    
                    prev_face_angle = current_frame_results["face_angle"]
                    face_distances.append(current_frame_results["face_distance"])
                    face_sizes.append(current_frame_results["face_size"])
                    
                    # Only capture face vector if all conditions are met
                    if (blink_count >= self.MIN_BLINK_COUNT and 
                        mouth_movement_count >= self.MIN_MOUTH_MOVEMENTS and 
                        consecutive_skin_frames >= self.MIN_SKIN_REFLECTANCE_FRAMES and
                        has_face_movement and
                        np.mean(face_distances) < self.MAX_FACE_DISTANCE and
                        np.mean(face_sizes) > self.MIN_FACE_SIZE):
                        if current_frame_results["face_vector"] is not None:
                            live_face_vector = current_frame_results["face_vector"]
                            logger.info(f"Frame {frame_count}: Captured face vector from a live frame.")
                    
                    # Update prev_landmarks
                    rgb_frame_for_landmarks = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    landmarks_result = self.face_mesh.process(rgb_frame_for_landmarks)
                    if landmarks_result.multi_face_landmarks:
                        prev_landmarks = landmarks_result.multi_face_landmarks[0]
                    else:
                        prev_landmarks = None
                        logger.info(f"Frame {frame_count}: No face detected by MediaPipe. Resetting prev_landmarks.")

                    if current_frame_results["screen_artifact"]:
                        screen_artifact_frames += 1
                    if not current_frame_results["skin_texture"]:
                        bad_texture_frames += 1
                else:
                    prev_landmarks = None
                    logger.info(f"Frame {frame_count}: No face detected by MediaPipe. Resetting prev_landmarks.")
                
                processed_frame_count += 1
            
            frame_count += 1
        
        cap.release()
        logger.info(f"Finished video processing. Total frames read: {frame_count}, Processed frames: {processed_frame_count}")
        logger.info(f"Blink count: {blink_count}, Mouth movements: {mouth_movement_count}, Skin reflectance frames: {skin_reflectance_frames}")
        logger.info(f"Face movement detected: {has_face_movement}, Average face distance: {np.mean(face_distances):.4f}, Average face size: {np.mean(face_sizes):.4f}")

        # Determine overall liveness based on minimum thresholds
        liveness_detected = (
            blink_count >= self.MIN_BLINK_COUNT and
            mouth_movement_count >= self.MIN_MOUTH_MOVEMENTS and
            consecutive_skin_frames >= self.MIN_SKIN_REFLECTANCE_FRAMES and
            has_face_movement and
            np.mean(face_distances) < self.MAX_FACE_DISTANCE and
            np.mean(face_sizes) > self.MIN_FACE_SIZE and
            has_blinked_overall and
            has_moved_mouth_overall and
            has_good_skin_reflectance_overall and
            screen_artifact_frames == 0 and
            bad_texture_frames == 0
        )

        logger.info(f"Overall Liveness Flags: Blink={has_blinked_overall}, Mouth={has_moved_mouth_overall}, Skin={has_good_skin_reflectance_overall}, Face Movement={has_face_movement}, Final Liveness={liveness_detected}")

        detection_details = {
            "blink_detected": has_blinked_overall,
            "mouth_movement": has_moved_mouth_overall,
            "skin_reflectance": has_good_skin_reflectance_overall,
            "face_movement": has_face_movement,
            "blink_count": blink_count,
            "mouth_movement_count": mouth_movement_count,
            "skin_reflectance_frames": skin_reflectance_frames,
            "average_face_distance": float(np.mean(face_distances)),
            "average_face_size": float(np.mean(face_sizes)),
            "screen_artifact_frames": screen_artifact_frames,
            "bad_texture_frames": bad_texture_frames
        }
        
        result = {
            "success": True,
            "is_live": liveness_detected,
            "face_vector": live_face_vector,
            "detection_details": detection_details
        }
        
        return convert_to_serializable(result)

    def __del__(self):
        """Clean up resources."""
        self.face_mesh.close()

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Please provide video path"}))
        sys.exit(1)
    
    detector = EnhancedLivenessDetector()
    result = detector.process_video(sys.argv[1])
    print(json.dumps(result)) 