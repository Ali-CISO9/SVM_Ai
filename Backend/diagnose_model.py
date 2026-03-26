"""
Test: Send a real image to the running backend and print the raw response.
This will confirm what the backend is actually returning.
"""
import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

import numpy as np
from tensorflow.keras.models import load_model

model = load_model("Model/my_cancer_detection_model.h5")

OUTPUT_FILE = "diag_output.txt"

with open(OUTPUT_FILE, "w") as f:
    f.write(f"Input shape : {model.input_shape}\n")
    f.write(f"Output shape: {model.output_shape}\n")
    
    # Test with a range of synthetic images to see class distribution
    # Create images with different characteristics to trigger different classes
    f.write("\n=== Testing with 20 varied synthetic images (/255 preprocessing) ===\n")
    
    class_counts = {}
    for i in range(20):
        np.random.seed(i * 42)
        img = np.random.randint(0, 256, (1, 224, 224, 3)).astype(np.float32) / 255.0
        pred = model.predict(img, verbose=0)[0]
        cls = int(np.argmax(pred))
        class_counts[cls] = class_counts.get(cls, 0) + 1
        f.write(f"  img{i}: class={cls}, probs=[{', '.join(f'{v:.6f}' for v in pred)}]\n")
    
    f.write(f"\nClass distribution: {class_counts}\n")
    
    # Now test by checking the model's internal weights, specifically the last layer
    last_layer = model.layers[-1]
    weights = last_layer.get_weights()
    f.write(f"\n=== Last layer (output) info ===\n")
    f.write(f"Layer name: {last_layer.name}\n")
    f.write(f"Config: {last_layer.get_config()}\n")
    f.write(f"Weight shapes: {[w.shape for w in weights]}\n")
    
    if len(weights) >= 2:
        biases = weights[1]
        f.write(f"Output biases: {[round(float(b), 6) for b in biases]}\n")
        f.write(f"Highest bias at index: {np.argmax(biases)}  ({round(float(np.max(biases)), 6)})\n")
        f.write(f"Lowest bias at index: {np.argmin(biases)}  ({round(float(np.min(biases)), 6)})\n")

    # Key test: create specific-colored images that might trigger different classes
    f.write("\n=== Testing with color-biased images (/255 preprocessing) ===\n")
    
    # Pure color images
    colors = {
        "red":   [255, 0, 0],
        "green": [0, 255, 0],
        "blue":  [0, 0, 255],
        "pink":  [255, 182, 193],
        "purple": [128, 0, 128],
        "brown": [139, 69, 19],
        "white": [255, 255, 255],
        "gray":  [128, 128, 128],
    }
    
    for name, color in colors.items():
        img = np.full((1, 224, 224, 3), color, dtype=np.float32) / 255.0
        pred = model.predict(img, verbose=0)[0]
        cls = int(np.argmax(pred))
        f.write(f"  {name:8s}: class={cls}, probs=[{', '.join(f'{v:.4f}' for v in pred)}]\n")

    f.write("\nDONE\n")

print(f"Output written to {OUTPUT_FILE}")
