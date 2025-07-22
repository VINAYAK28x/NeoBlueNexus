import dlib
import cv2
import numpy as np
import os # Import os module

# Get the directory of the current script
script_dir = os.path.dirname(os.path.abspath(__file__))

detector = dlib.get_frontal_face_detector()
shape_predictor = dlib.shape_predictor(os.path.join(script_dir, "shape_predictor_68_face_landmarks.dat"))
face_rec_model = dlib.face_recognition_model_v1(os.path.join(script_dir, "dlib_face_recognition_resnet_model_v1.dat"))

def get_face_embedding(image):
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
rects = detector(gray)
if len(rects) == 0:
return None
shape = shape_predictor(gray, rects[0])
face_descriptor = face_rec_model.compute_face_descriptor(image, shape)
return np.array(face_descriptor)