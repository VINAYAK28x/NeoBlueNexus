import cv2
import mediapipe as mp
mp_face_mesh = mp.solutions.face_mesh
LEFT_EYE = [362, 385, 387, 263, 373, 380]
RIGHT_EYE = [33, 160, 158, 133, 153, 144]
def get_eye_aspect_ratio(landmarks, eye_indices, image_w, image_h):
    points = [(int(landmarks[i].x * image_w), int(landmarks[i].y * image_h)) for i in eye_indices]
    vertical_1 = abs(points[1][1] - points[5][1])
    vertical_2 = abs(points[2][1] - points[4][1])
    horizontal = abs(points[0][0] - points[3][0])
    return (vertical_1 + vertical_2) / (2.0 * horizontal)
def detect_blink(frame, face_mesh):
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = face_mesh.process(rgb_frame)
    if results.multi_face_landmarks:
        for face_landmarks in results.multi_face_landmarks:
            h, w = frame.shape[:2]
            left_ear = get_eye_aspect_ratio(face_landmarks.landmark, LEFT_EYE, w, h)
            right_ear = get_eye_aspect_ratio(face_landmarks.landmark, RIGHT_EYE, w, h)
            ear = (left_ear + right_ear) / 2.0
            if ear < 0.22:  # Blink threshold
                return True
    return False