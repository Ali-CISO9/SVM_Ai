"""
Test the model on the user's specific test images to find the true class mapping.
"""
import os
import glob
import cv2
import numpy as np

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
from tensorflow.keras.models import load_model

model_path = r"C:\Users\Ali-IT\Desktop\SVM_Ai-main\backend\Model\my_cancer_detection_model.keras"
test_dir = r"C:\Users\Ali-IT\Desktop\SVM_Ai-main\backend\testingImages"

print(f"Loading model from {model_path}...")
model = load_model(model_path)

# Find all images in the testingImages folder
image_paths = []
for ext in ('*.png', '*.jpg', '*.jpeg'):
    image_paths.extend(glob.glob(os.path.join(test_dir, ext)))

if not image_paths:
    print(f"No test images found in {test_dir}.")
else:
    print(f"Found {len(image_paths)} test images. Running predictions...\n")
    
    for img_path in sorted(image_paths):
        filename = os.path.basename(img_path)
        
        # Read and preprocess exactly like the backend does
        with open(img_path, "rb") as f:
            file_bytes = f.read()
            
        nparr = np.frombuffer(file_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            print(f"{filename}: Failed to decode")
            continue
            
        # Resize, convert, expand, normalize (/255)
        image = cv2.resize(image, (224, 224), interpolation=cv2.INTER_AREA)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image = np.expand_dims(image, axis=0)
        image = image.astype(np.float32) / 255.0
        
        # Predict
        pred = model.predict(image, verbose=0)[0]
        max_idx = int(np.argmax(pred))
        max_conf = float(np.max(pred))
        
        print(f"File: {filename:<30} | Predicted Index: {max_idx} | Confidence: {max_conf:.4f}")
        print(f"      Probs: {[round(float(v), 4) for v in pred]}")

print("\nDONE")
