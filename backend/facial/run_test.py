import cv2
from face_embedding import get_face_embedding
from liveliness_check import detect_blink
import mediapipe as mp
from face_utils import compare_face_vectors
face_mesh = mp.solutions.face_mesh.FaceMesh(refine_landmarks=True)
cap = cv2.VideoCapture(0)
live_vector = None
blink_detected = False
print("[INFO] Please blink once to verify liveliness...")
while True:
ret, frame = cap.read()
if not ret:
break
if not blink_detected and detect_blink(frame, face_mesh):
print("[INFO] Blink detected.")
blink_detected = True
live_vector = get_face_embedding(frame)
if live_vector is not None:
print("[INFO] Facial embedding extracted.")
break
cv2.imshow("Liveliness Check", frame)
if cv2.waitKey(1) & 0xFF == ord('q'):
break
cap.release()
cv2.destroyAllWindows()
# Test with a stored Aadhaar image (replace path)
aadhaar_img = cv2.imread("aadhaar.jpg")
aadhaar_vector = get_face_embedding(aadhaar_img)
if live_vector is not None and aadhaar_vector is not None:
match = compare_face_vectors(live_vector, aadhaar_vector)
print("MATCHED" if match else "NOT MATCHED")
else:
print("Failed to get embeddings")