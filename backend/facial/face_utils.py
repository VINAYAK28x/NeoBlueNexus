import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
def compare_face_vectors(vec1, vec2, threshold=0.5):
similarity = cosine_similarity([vec1], [vec2])[0][0]
return similarity > threshold
def extract_face_from_image(image, detector):
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
rects = detector(gray, 1)
if len(rects) > 0:
return rects[0]
return None