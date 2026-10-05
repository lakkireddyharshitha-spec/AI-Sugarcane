import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "rf_risk_model.joblib")

def generate_agricultural_risk_dataset(n_samples=2500, random_state=42):
    np.random.seed(random_state)

    temperatures = np.random.uniform(15.0, 42.0, n_samples)
    humidities = np.random.uniform(30.0, 98.0, n_samples)
    rainfalls = np.random.uniform(0.0, 150.0, n_samples)
    soil_moistures = np.random.uniform(15.0, 95.0, n_samples)
    soil_phs = np.random.uniform(4.8, 9.2, n_samples)
    crop_ages = np.random.randint(15, 360, n_samples)

    labels = []
    scores = []

    for i in range(n_samples):
        temp = temperatures[i]
        hum = humidities[i]
        rain = rainfalls[i]
        moist = soil_moistures[i]
        ph = soil_phs[i]
        age = crop_ages[i]

        score = 0.0

        # Humidity influence (fungal spore germination)
        if hum >= 85:
            score += 35
        elif hum >= 70:
            score += 20
        elif hum < 45:
            score += 5

        # Temperature influence (pathogen growth range 26-34C)
        if 28 <= temp <= 35:
            score += 25
        elif 24 <= temp < 28 or 35 < temp <= 38:
            score += 15
        else:
            score += 5

        # Soil moisture influence
        if moist >= 80:
            score += 20  # Waterlogging promotes root rot and red rot
        elif moist <= 25:
            score += 15  # Water stress weakens plant immunity
        elif 45 <= moist <= 65:
            score -= 5   # Ideal moisture reduces stress

        # Rainfall influence
        if rain >= 60:
            score += 15
        elif rain >= 25:
            score += 10

        # Soil pH stress
        if ph < 5.8 or ph > 8.2:
            score += 10
        elif 6.5 <= ph <= 7.5:
            score -= 5

        # Crop age susceptibility (Tillering & Grand Growth are peak infection periods)
        if 90 <= age <= 240:
            score += 10

        # Add minor random noise
        score += np.random.normal(0, 3)
        score = max(0.0, min(100.0, score))
        scores.append(score)

        if score >= 60.0:
            labels.append("High Risk")
        elif score >= 35.0:
            labels.append("Medium Risk")
        else:
            labels.append("Low Risk")

    df = pd.DataFrame({
        "temperature": temperatures,
        "humidity": humidities,
        "rainfall": rainfalls,
        "soil_moisture": soil_moistures,
        "soil_ph": soil_phs,
        "crop_age": crop_ages,
        "risk_score": scores,
        "risk_level": labels
    })
    return df

def train_and_save_model():
    print("Generating agricultural environmental disease risk dataset...")
    df = generate_agricultural_risk_dataset()
    X = df[["temperature", "humidity", "rainfall", "soil_moisture", "soil_ph", "crop_age"]]
    y = df["risk_level"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print("Training RandomForestClassifier...")
    clf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Model trained successfully! Test Accuracy: {acc * 100:.2f}%")
    print(classification_report(y_test, y_pred))

    joblib.dump({
        "model": clf,
        "features": list(X.columns),
        "classes": list(clf.classes_),
        "accuracy": acc
    }, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")

if __name__ == "__main__":
    train_and_save_model()
