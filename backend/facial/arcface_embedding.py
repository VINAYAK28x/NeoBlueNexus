import cv2
import numpy as np
import insightface
from insightface.app import FaceAnalysis
import os
import sys
import io

# Create a context manager to redirect stdout
class StdoutRedirect:
    def __init__(self):
        self.old_stdout = sys.stdout
        self.redirected_output = io.StringIO()
        
    def __enter__(self):
        sys.stdout = self.redirected_output
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout = self.old_stdout
        # Write the captured output to stderr
        sys.stderr.write(self.redirected_output.getvalue())

# Get the absolute path to the models directory
current_dir = os.path.dirname(os.path.abspath(__file__))
models_dir = os.path.join(current_dir, 'models')

# Initialize ArcFace model with stdout redirection
with StdoutRedirect():
    app = FaceAnalysis(
        name='buffalo_l',
        root=models_dir,
        providers=['CPUExecutionProvider']
    )
    app.prepare(ctx_id=0, det_size=(640, 640))

def get_face_embedding(image):
    """
    Extract face embedding using ArcFace
    Args:
        image: numpy array of the image in BGR format
    Returns:
        numpy array of face embedding (512-dimensional vector)
    """
    try:
        # Detect faces with stdout redirection
        with StdoutRedirect():
            faces = app.get(image)
        
        if len(faces) == 0:
            print("No face detected by ArcFace in the image.", file=sys.stderr)
            return None
            
        # Get the first face embedding
        face = faces[0]
        embedding = face.embedding
        
        return embedding
        
    except Exception as e:
        print(f"Error in get_face_embedding: {str(e)}", file=sys.stderr)
        return None

def compare_faces(embedding1, embedding2, threshold=0.35):
    """
    Compare two face embeddings using cosine similarity
    Args:
        embedding1: first face embedding
        embedding2: second face embedding
        threshold: similarity threshold (default: 0.35)
    Returns:
        bool: True if faces match, False otherwise
        float: similarity score
    """
    if embedding1 is None or embedding2 is None:
        return False, 0.0
        
    # Calculate cosine similarity
    similarity = np.dot(embedding1, embedding2) / (np.linalg.norm(embedding1) * np.linalg.norm(embedding2))
    
    # Print similarity score for debugging
    print(f"Face similarity score: {similarity:.4f}", file=sys.stderr)
    
    return similarity > threshold, similarity 