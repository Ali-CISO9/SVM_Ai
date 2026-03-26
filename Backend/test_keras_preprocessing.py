"""
Test model using strictly Keras native preprocessing (PIL) instead of OpenCV.
"""
import os
import glob
import numpy as np

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.vgg16 import preprocess_input

model_path = r"C:\Users\Ali-IT\Desktop\SVM_Ai-main\backend\Model\my_cancer_detection_model.h5"
test_dir = r"C:\Users\Ali-IT\Desktop\SVM_Ai-main\backend\testingImages"

print("Loading model...")
model = load_model(model_path)

image_paths = []
for ext in ('*.png', '*.jpg', '*.jpeg'):
    image_paths.extend(glob.glob(os.path.join(test_dir, ext)))

for img_path in sorted(image_paths):
    filename = os.path.basename(img_path)
    
    # Load using pure Keras (PIL internally, RGB by default)
    img = image.load_img(img_path, target_size=(224, 224))
    x = image.img_to_array(img)
    x = np.expand_dims(x, axis=0)
    
    # Test 1: rescale=1./255
    x_rescale = x / 255.0
    pred_rescale = model.predict(x_rescale, verbose=0)[0]
    
    # Test 2: VGG16 preprocess (just in case)
    x_vgg = preprocess_input(np.copy(x))
    pred_vgg = model.predict(x_vgg, verbose=0)[0]
    
    print(f"\n{filename}:")
    print(f"  Rescale predict : Idx={np.argmax(pred_rescale)}  Probs={[round(float(v), 4) for v in pred_rescale]}")
    print(f"  VGG16 predict   : Idx={np.argmax(pred_vgg)}  Probs={[round(float(v), 4) for v in pred_vgg]}")

print("\nDONE")
