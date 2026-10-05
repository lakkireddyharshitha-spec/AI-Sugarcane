import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from database import Base

class Farm(Base):
    __tablename__ = "farms"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    farm_name = Column(String(120), nullable=False)
    village = Column(String(120), nullable=False)
    district = Column(String(120), nullable=False)
    farm_area = Column(Float, nullable=False)  # in acres
    soil_type = Column(String(80), nullable=False)  # Alluvial, Black, Red, Sandy Loam, Clay Loam
    sugarcane_variety = Column(String(80), nullable=False)  # e.g., Co 0238, Co 86032, Co 0118
    planting_date = Column(Date, nullable=False)
    irrigation_type = Column(String(80), nullable=False)  # Drip, Furrow, Sprinkler, Flood
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="farms")
    disease_detections = relationship("DiseaseDetection", back_populates="farm", cascade="all, delete-orphan")
    environmental_readings = relationship("EnvironmentalReading", back_populates="farm", cascade="all, delete-orphan")
    crop_observations = relationship("CropObservation", back_populates="farm", cascade="all, delete-orphan")
    risk_predictions = relationship("RiskPrediction", back_populates="farm", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="farm", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="farm", cascade="all, delete-orphan")
