"""
FastAPI Backend for Lung Cancer Detection System.
This server provides a REST API endpoint for predicting lung cancer
from histopathology images using a trained VGG16-based Keras model.
"""

import os
from pathlib import Path
from typing import Dict, Any

import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model

from utils.preprocessing import extract_features_from_bytes

# Initialize FastAPI application
app = FastAPI(
    title="Lung Cancer Detection API",
    description="API for detecting lung cancer from histopathology images using a VGG16-based Keras model",
    version="2.0.0"
)

# Configure CORS to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variable to hold the loaded model
model = None

# Get the path to the model file
MODEL_PATH = Path(__file__).parent / "Model" / "my_cancer_detection_model.keras"

# Class labels corresponding to model output indices (5-class softmax)
# Note: The mapping below was empirically proven using test images.
CLASS_LABELS = {
    0: ("Colon Adenocarcinoma", "critical"),
    1: ("Colon Benign Tissue", "healthy"),
    2: ("Lung Adenocarcinoma", "critical"),
    3: ("Lung Squamous Cell Carcinoma", "critical"),
    4: ("Normal", "healthy"), # Normal Lung Tissue
}


@app.on_event("startup")
async def load_model_on_startup():
    """
    Load the Keras model when the application starts.
    This ensures the model is loaded once and kept in memory.
    """
    global model

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model file not found at {MODEL_PATH}. "
            "Please ensure my_cancer_detection_model.h5 is in the Model directory."
        )

    try:
        # Suppress TF startup noise
        os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
        model = load_model(str(MODEL_PATH))
        print(f"Model loaded successfully from {MODEL_PATH}")
        print(f"  Input shape : {model.input_shape}")
        print(f"  Output shape: {model.output_shape}")
    except Exception as e:
        raise RuntimeError(f"Failed to load model: {str(e)}")


@app.get("/")
async def root() -> Dict[str, str]:
    """
    Root endpoint to check if the API is running.
    """
    return {
        "message": "Lung Cancer Detection API is running",
        "status": "healthy",
        "model_loaded": str(model is not None)
    }


@app.get("/health")
async def health_check() -> Dict[str, Any]:
    """
    Health check endpoint to verify the API and model status.
    """
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "model_path": str(MODEL_PATH)
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)) -> Dict[str, str]:
    """
    Predict lung cancer from a histopathology image.

    Args:
        file: Uploaded image file (supports jpg, jpeg, png, bmp, tiff)

    Returns:
        JSON response with prediction label and status.
        The label is a class name; status is 'healthy' or 'critical'.

    Raises:
        HTTPException: If model is not loaded, file is invalid, or prediction fails
    """
    # Check if model is loaded
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please restart the server."
        )

    # Validate file type
    allowed_extensions = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".tif"}
    file_extension = Path(file.filename).suffix.lower() if file.filename else ""

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(allowed_extensions)}"
        )

    try:
        # Read file bytes
        file_bytes = await file.read()

        # Preprocess image into model-compatible tensor (1, 224, 224, 3)
        image_tensor = extract_features_from_bytes(file_bytes)

        # Run inference — returns array of shape (1, 5) with class probabilities
        predictions = model.predict(image_tensor, verbose=0)  # shape: (1, 5)

        # Pick the class with the highest probability
        predicted_class = int(np.argmax(predictions[0]))
        confidence = float(np.max(predictions[0]))

        label, status = CLASS_LABELS.get(predicted_class, ("Unknown", "unknown"))

        return {
            "label": label,
            "status": status,
            "confidence": f"{confidence:.2%}",
            "class_index": str(predicted_class)
        }

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=f"Image processing error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction error: {str(e)}"
        )


if __name__ == "__main__":
    import uvicorn

    # Run the server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
