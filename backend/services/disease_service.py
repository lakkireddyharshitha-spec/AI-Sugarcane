import os
import uuid
import json
from typing import Dict, Any, Tuple
from PIL import Image
import numpy as np

from services.dataset_service import get_class_mapping

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORKSPACE_DIR = os.path.dirname(BASE_DIR)
UPLOADS_DIR = os.path.join(WORKSPACE_DIR, "uploads")
MODELS_DIR = os.path.join(WORKSPACE_DIR, "ml_models")

os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(MODELS_DIR, exist_ok=True)

def analyze_leaf_image(image_path: str) -> Dict[str, Any]:
    """
    Classify sugarcane leaf image.
    Uses trained CNN if model weights exist.
    Otherwise gracefully falls back to explicit DEMO MODE with real image color heuristic analysis.
    """
    mapping = get_class_mapping()
    cnn_model_path = os.path.join(MODELS_DIR, "sugarcane_cnn.pt")

    # Check if a trained neural network model is available
    if os.path.exists(cnn_model_path):
        try:
            import torch
            import torchvision.transforms as transforms

            device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            model = torch.load(cnn_model_path, map_location=device)
            model.eval()

            transform = transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            ])

            img = Image.open(image_path).convert("RGB")
            tensor = transform(img).unsqueeze(0).to(device)

            with torch.no_grad():
                outputs = model(tensor)
                probs = torch.nn.functional.softmax(outputs, dim=1)
                conf, pred = torch.max(probs, 1)
                predicted_class = int(pred.item())
                confidence = float(conf.item()) * 100.0

            class_info = mapping.get(str(predicted_class), mapping.get("0"))
            return {
                "disease_class": predicted_class,
                "disease_name": class_info["name"],
                "confidence_score": round(confidence, 1),
                "severity": class_info["severity"],
                "description": class_info["description"],
                "recommendations": " | ".join(class_info["next_steps"]),
                "is_demo": False,
                "status_badge": "Live CNN Inference"
            }
        except Exception as e:
            # Fall through to demo mode if inference fails
            pass

    # DEMO MODE: Image heuristic feature extraction (Greenness vs Redness & Variance)
    try:
        img = Image.open(image_path).convert("RGB")
        img_thumb = img.resize((100, 100))
        arr = np.array(img_thumb, dtype=np.float32)
        r = arr[:, :, 0].mean()
        g = arr[:, :, 1].mean()
        b = arr[:, :, 2].mean()

        # Heuristic classification for responsive demo testing based on real leaf pixels
        # Healthy: High green, lower red
        # Red Rot: High red / brown spots on midrib
        # Mosaic: Patchy green/yellow variation (high standard deviation)
        # Leaf Scald: Pale white streaks (high brightness, low saturation)
        # Yellow Leaf: High yellow (high red + high green, low blue)

        std_dev = arr.std()
        red_green_ratio = r / (g + 1e-5)
        yellow_index = (r + g) / (2 * (b + 1e-5))

        if red_green_ratio > 0.95 or (r > 120 and r > g * 0.85):
            predicted_class = 1  # Red Rot
            confidence = min(96.4, 82.0 + (red_green_ratio * 8.5))
        elif yellow_index > 1.8 and g > 110:
            predicted_class = 4  # Yellow Leaf Disease
            confidence = min(94.2, 80.0 + (yellow_index * 6.0))
        elif std_dev > 52.0:
            predicted_class = 2  # Sugarcane Mosaic Virus
            confidence = min(92.5, 78.0 + (std_dev * 0.25))
        elif r > 140 and g > 140 and b > 140:
            predicted_class = 3  # Leaf Scald (bleached / scalded streaks)
            confidence = min(91.0, 81.0 + (arr.mean() * 0.05))
        else:
            predicted_class = 0  # Healthy
            confidence = min(97.8, 86.0 + (g / 20.0))

        confidence = round(float(confidence), 1)
    except Exception:
        # Fallback to healthy if image parsing fails
        predicted_class = 0
        confidence = 88.5

    class_info = mapping.get(str(predicted_class), mapping.get("0"))
    return {
        "disease_class": predicted_class,
        "disease_name": class_info["name"],
        "confidence_score": confidence,
        "severity": class_info["severity"],
        "description": class_info["description"],
        "recommendations": " | ".join(class_info["next_steps"]),
        "is_demo": True,
        "status_badge": "DEMO MODE (Simulated Analysis)"
    }
