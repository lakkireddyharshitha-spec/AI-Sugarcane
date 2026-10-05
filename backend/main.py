import os
import sys
import datetime

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import engine, Base, SessionLocal
from models.user import User
from models.farm import Farm
from models.environmental import EnvironmentalReading
from models.crop_observation import CropObservation
from models.disease_detection import DiseaseDetection
from models.risk_prediction import RiskPrediction
from models.alert import Alert
from services.auth_service import get_password_hash
from services.dataset_service import ensure_dataset_files
from services.disease_service import UPLOADS_DIR

from routes.auth import router as auth_router
from routes.farms import router as farms_router
from routes.diseases import router as diseases_router
from routes.environmental import router as environmental_router
from routes.risk import router as risk_router
from routes.growth import router as growth_router
from routes.alerts import router as alerts_router
from routes.recommendations import router as recommendations_router
from routes.analytics import router as analytics_router
from routes.reports import router as reports_router

app = FastAPI(
    title="CaneGuard AI API",
    description="AI-Based Sugarcane Growth Monitoring and Early Disease Prediction System",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for leaf image uploads
os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# Include Routers
app.include_router(auth_router, prefix="/api")
app.include_router(farms_router, prefix="/api")
app.include_router(diseases_router, prefix="/api")
app.include_router(environmental_router, prefix="/api")
app.include_router(risk_router, prefix="/api")
app.include_router(growth_router, prefix="/api")
app.include_router(alerts_router, prefix="/api")
app.include_router(recommendations_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(reports_router, prefix="/api")

@app.get("/")
def root():
    return {
        "system": "CaneGuard AI API",
        "status": "Online",
        "documentation": "/docs",
        "version": "1.0.0"
    }

def seed_database_if_empty():
    """Seed initial demo account with realistic sugarcane farm records."""
    db = SessionLocal()
    try:
        # Check if demo user already exists
        demo_user = db.query(User).filter(User.email == "farmer@caneguard.ai").first()
        if not demo_user:
            demo_user = User(
                full_name="Rajesh Patel",
                email="farmer@caneguard.ai",
                phone_number="+91 98765 43210",
                hashed_password=get_password_hash("Farmer@123"),
                role="farmer"
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)

            # Seed Farm 1: Green Valley Cane Estate
            farm1 = Farm(
                user_id=demo_user.id,
                farm_name="Green Valley Cane Estate",
                village="Mandya Rural",
                district="Mandya",
                farm_area=12.5,
                soil_type="Alluvial Loam",
                sugarcane_variety="Co 86032 (Nayana)",
                planting_date=datetime.date(2026, 3, 15),
                irrigation_type="Drip Irrigation"
            )
            # Seed Farm 2: Kaveri Riverfront Plot
            farm2 = Farm(
                user_id=demo_user.id,
                farm_name="Kaveri Riverfront Plot",
                village="Srirangapatna",
                district="Mandya",
                farm_area=8.0,
                soil_type="Black Clay",
                sugarcane_variety="Co 0238 (Karan 4)",
                planting_date=datetime.date(2026, 4, 10),
                irrigation_type="Furrow Irrigation"
            )
            db.add_all([farm1, farm2])
            db.commit()
            db.refresh(farm1)
            db.refresh(farm2)

            # Seed Environmental Readings for Farm 1
            today = datetime.date.today()
            env_records = [
                EnvironmentalReading(
                    user_id=demo_user.id,
                    farm_id=farm1.id,
                    temperature=29.5,
                    humidity=74.0,
                    rainfall=14.2,
                    soil_moisture=56.0,
                    soil_ph=6.8,
                    crop_age=160,
                    irrigation_status="Active",
                    reading_date=today - datetime.timedelta(days=6)
                ),
                EnvironmentalReading(
                    user_id=demo_user.id,
                    farm_id=farm1.id,
                    temperature=31.0,
                    humidity=78.5,
                    rainfall=8.0,
                    soil_moisture=52.0,
                    soil_ph=6.7,
                    crop_age=162,
                    irrigation_status="Scheduled",
                    reading_date=today - datetime.timedelta(days=4)
                ),
                EnvironmentalReading(
                    user_id=demo_user.id,
                    farm_id=farm1.id,
                    temperature=32.2,
                    humidity=82.0,
                    rainfall=24.5,
                    soil_moisture=65.0,
                    soil_ph=6.9,
                    crop_age=164,
                    irrigation_status="Active",
                    reading_date=today - datetime.timedelta(days=2)
                ),
                EnvironmentalReading(
                    user_id=demo_user.id,
                    farm_id=farm1.id,
                    temperature=30.8,
                    humidity=86.0,
                    rainfall=38.0,
                    soil_moisture=72.0,
                    soil_ph=6.8,
                    crop_age=166,
                    irrigation_status="Inactive",
                    reading_date=today
                )
            ]
            db.add_all(env_records)

            # Seed Crop Observations for Farm 1 (Growth trend)
            obs_records = [
                CropObservation(
                    user_id=demo_user.id,
                    farm_id=farm1.id,
                    observation_date=today - datetime.timedelta(days=90),
                    crop_age=75,
                    plant_height=78.0,
                    growth_stage="Tillering",
                    leaf_condition="Vibrant Green",
                    notes="Uniform tiller emergence; minimal weed pressure."
                ),
                CropObservation(
                    user_id=demo_user.id,
                    farm_id=farm1.id,
                    observation_date=today - datetime.timedelta(days=60),
                    crop_age=105,
                    plant_height=132.0,
                    growth_stage="Tillering",
                    leaf_condition="Vibrant Green",
                    notes="Completed partial earthing up; robust stalk girth."
                ),
                CropObservation(
                    user_id=demo_user.id,
                    farm_id=farm1.id,
                    observation_date=today - datetime.timedelta(days=30),
                    crop_age=135,
                    plant_height=195.0,
                    growth_stage="Grand Growth",
                    leaf_condition="Vibrant Green",
                    notes="Rapid internode elongation; healthy deep green canopy."
                ),
                CropObservation(
                    user_id=demo_user.id,
                    farm_id=farm1.id,
                    observation_date=today,
                    crop_age=165,
                    plant_height=248.0,
                    growth_stage="Grand Growth",
                    leaf_condition="Vibrant Green",
                    notes="Canopy closed; height tracking above ICAR sigmoid benchmark."
                )
            ]
            db.add_all(obs_records)

            # Seed Disease Detections
            det1 = DiseaseDetection(
                user_id=demo_user.id,
                farm_id=farm1.id,
                image_filename="sample_healthy_leaf.jpg",
                image_path="uploads/sample_healthy_leaf.jpg",
                disease_class=0,
                disease_name="Healthy Sugarcane",
                confidence_score=96.4,
                severity="None",
                description="Foliage exhibits vigorous chlorophyll pigmentation, uniform venation, and absence of necrotic lesions.",
                recommendations="Continue scheduled irrigation and balanced NPK nutrition. Maintain bi-weekly inspections.",
                is_demo=True
            )
            det2 = DiseaseDetection(
                user_id=demo_user.id,
                farm_id=farm2.id,
                image_filename="sample_mosaic_leaf.jpg",
                image_path="uploads/sample_mosaic_leaf.jpg",
                disease_class=2,
                disease_name="Sugarcane Mosaic Virus",
                confidence_score=89.2,
                severity="Moderate",
                description="Potyvirus transmitted primarily by corn leaf aphids, resulting in contrasting dark and light green chlorotic mottling on younger leaves.",
                recommendations="Eradicate aphid vectors using approved biological spray. Rogue out severely stunted stools.",
                is_demo=True
            )
            db.add_all([det1, det2])

            # Seed Risk Prediction
            risk1 = RiskPrediction(
                user_id=demo_user.id,
                farm_id=farm1.id,
                temperature=30.8,
                humidity=86.0,
                rainfall=38.0,
                soil_moisture=72.0,
                soil_ph=6.8,
                crop_age=166,
                risk_level="Medium Risk",
                risk_score=58.5,
                risk_explanation="Elevated relative humidity (86%) and recent 38mm rainfall increase foliar humidity pocket risk.",
                contributing_factors='[{"parameter": "Relative Humidity", "value": "86%", "impact": "High Risk", "detail": "Spore germination favored"}, {"parameter": "Soil Moisture", "value": "72%", "impact": "Moderate", "detail": "Near saturation"}]',
                suggestions='["Inspect 20 random clumps weekly for leaf midrib lesions", "Ensure field drainage canals are unobstructed"]',
                model_used="RandomForestClassifier (Trained Model - Scikit-Learn)",
                is_demo=False
            )
            db.add(risk1)

            # Seed Initial Alerts
            alert1 = Alert(
                user_id=demo_user.id,
                farm_id=farm1.id,
                title="High Humidity & Rainfall Alert",
                category="Environmental Warning",
                severity="Medium",
                reason="Continuous humidity > 85% observed over 48 hours.",
                recommended_action="Conduct leaf midrib inspection for early fungal lesions.",
                is_read=False
            )
            alert2 = Alert(
                user_id=demo_user.id,
                farm_id=farm2.id,
                title="Pathogen Detected: Sugarcane Mosaic Virus",
                category="Disease Risk",
                severity="Medium",
                reason="AI scan flagged mosaic symptoms with 89.2% confidence.",
                recommended_action="Rogue out affected clumps and manage aphid vectors.",
                is_read=False
            )
            db.add_all([alert1, alert2])

            db.commit()
            print("Database initialized and demo data successfully seeded.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    ensure_dataset_files()
    seed_database_if_empty()
