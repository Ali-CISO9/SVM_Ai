"""
Preprocessing module for Lung Cancer Detection.
Prepares histopathology images for input into the VGG16-based Keras model.

The model expects:
  - Input shape : (1, 224, 224, 3)  — single RGB image
  - Pixel values: normalized to [0, 1] via rescale=1./255
                  (this matches the ImageDataGenerator used during training)
"""

import cv2
import numpy as np


# Target image dimensions expected by the model
IMG_HEIGHT = 224
IMG_WIDTH = 224


def extract_features_from_bytes(file_bytes: bytes) -> np.ndarray:
    """
    Prepare an image for prediction with the VGG16-based Keras model.

    Steps:
    1. Decode raw bytes to an image matrix (BGR via OpenCV)
    2. Resize to 224x224
    3. Convert BGR -> RGB
    4. Expand dimensions to (1, 224, 224, 3)
    5. Normalize pixel values to [0, 1] (rescale=1./255)

    Args:
        file_bytes: Raw image bytes from an UploadFile

    Returns:
        np.ndarray: Preprocessed image tensor of shape (1, 224, 224, 3)
                    ready for model.predict()

    Raises:
        ValueError: If the image cannot be decoded from the given bytes
    """
    # Step 1: Decode bytes to an image matrix (OpenCV reads as BGR)
    nparr = np.frombuffer(file_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if image is None:
        raise ValueError("Failed to decode image from bytes. Invalid image format.")

    # Step 2: Resize to the model's expected spatial input dimensions
    image = cv2.resize(image, (IMG_WIDTH, IMG_HEIGHT), interpolation=cv2.INTER_AREA)

    # Step 3: Convert BGR (OpenCV default) to RGB (Keras/TF convention)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Step 4: Add batch dimension -> (1, 224, 224, 3)
    image = np.expand_dims(image, axis=0)

    # Step 5: Cast to float32 and normalize to [0, 1] to match training
    image = image.astype(np.float32)
    image = image / 255.0

    return image
