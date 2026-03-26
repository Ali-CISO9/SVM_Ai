"""
Test model using ImageNet standardization (mean/std).
"""
import os
import glob
import numpy as np

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image

model_path = r"C:\Users\Ali-IT\Desktop\SVM_Ai-main\backend\Model\my_cancer_detection_model.h5"
test_dir = r"C:\Users\Ali-IT\Desktop\SVM_Ai-main\backend\testingImages"

print("Loading model...")
model = load_model(model_path)

image_paths = []
for ext in ('*.png', '*.jpg', '*.jpeg'):
    image_paths.extend(glob.glob(os.path.join(test_dir, ext)))

for img_path in sorted(image_paths):
    filename = os.path.basename(img_path)
    
    img = image.load_img(img_path, target_size=(224, 224))
    x = image.img_to_array(img)
    x = np.expand_dims(x, axis=0)
    
    # Standard ImageNet preprocessing (used by PyTorch/fastai)
    x_std = x / 255.0
    x_std[..., 0] = (x_std[..., 0] - 0.485) / 0.229
    x_std[..., 1] = (x_std[..., 1] - 0.456) / 0.224
    x_std[..., 2] = (x_std[..., 2] - 0.406) / 0.225
    
    pred_std = model.predict(x_std, verbose=0)[0]
    
    print(f"\n{filename}:")
    print(f"  Std predict : Idx={np.argmax(pred_std)}  Probs={[round(float(v), 4) for v in pred_std]}")

print("\nDONE")
