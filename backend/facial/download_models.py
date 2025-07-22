import os
import insightface
from insightface.app import FaceAnalysis
import sys
import onnxruntime

def main():
    try:
        # Get the absolute path to the models directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        models_dir = os.path.join(current_dir, 'models')
        
        print(f"Current directory: {current_dir}")
        print(f"Models will be downloaded to: {models_dir}")
        
        # Create models directory if it doesn't exist
        if not os.path.exists(models_dir):
            os.makedirs(models_dir)
            print("Created models directory")
        
        print("\nChecking ONNX Runtime...")
        print(f"ONNX Runtime version: {onnxruntime.__version__}")
        print(f"Available providers: {onnxruntime.get_available_providers()}")
        
        print("\nInitializing ArcFace...")
        # Initialize ArcFace with explicit model download
        app = FaceAnalysis(
            name='buffalo_l',
            root=models_dir,
            providers=['CPUExecutionProvider']
        )
        
        print("\nDownloading models...")
        # Force model download
        app.prepare(ctx_id=0, det_size=(640, 640))
        
        # Verify model files exist
        print("\nChecking downloaded files...")
        model_files = os.listdir(models_dir)
        if not model_files:
            raise Exception("No model files were downloaded")
            
        print("\nDownloaded model files:")
        for file in model_files:
            file_path = os.path.join(models_dir, file)
            file_size = os.path.getsize(file_path) / (1024 * 1024)  # Convert to MB
            print(f"- {file} ({file_size:.2f} MB)")
            
        print("\nArcFace models downloaded successfully!")
        
    except Exception as e:
        print(f"Error downloading models: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main() 