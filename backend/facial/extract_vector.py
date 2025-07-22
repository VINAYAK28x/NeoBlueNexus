import cv2
import numpy as np
import sys
import json
import os
from arcface_embedding import get_face_embedding

# Redirect all stdout to stderr for debug output
class StderrRedirect:
    def write(self, message):
        sys.stderr.write(message)
    def flush(self):
        sys.stderr.flush()

# Redirect stdout to stderr for all debug output
sys.stdout = StderrRedirect()

def extract_face_vector(image_path):
    try:
        # Load the image
        image = cv2.imread(image_path)
        if image is None:
            return {"error": "Could not load image"}

        # Get face embedding using ArcFace
        face_vector = get_face_embedding(image)
        
        if face_vector is None:
            return {"error": "No face detected in the image"}

        # Convert to list for JSON serialization
        vector = face_vector.tolist()
        
        # Verify the vector is valid
        if not isinstance(vector, list) or len(vector) == 0:
            return {"error": "Invalid face vector format"}

        return {"vector": vector}

    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Please provide image path"}))
        sys.exit(1)

    image_path = sys.argv[1]
    result = extract_face_vector(image_path)
    
    # Ensure we're outputting valid JSON
    try:
        # Temporarily restore stdout for JSON output
        original_stdout = sys.stdout
        sys.stdout = sys.__stdout__
        
        # Print only the JSON to stdout
        print(json.dumps(result))
        
        # Restore stderr redirect
        sys.stdout = original_stdout
    except Exception as e:
        # Restore stdout for error output
        sys.stdout = sys.__stdout__
        print(json.dumps({"error": f"Error serializing result: {str(e)}"}))
        sys.exit(1) 