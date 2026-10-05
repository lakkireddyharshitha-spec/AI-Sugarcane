import datetime
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    phone_number = Column(String(30), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(30), default="farmer")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    farms = relationship("Farm", back_populates="owner", cascade="all, delete-orphan")
    disease_detections = relationship("DiseaseDetection", back_populates="user", cascade="all, delete-orphan")
    environmental_readings = relationship("EnvironmentalReading", back_populates="user", cascade="all, delete-orphan")
    crop_observations = relationship("CropObservation", back_populates="user", cascade="all, delete-orphan")
    risk_predictions = relationship("RiskPrediction", back_populates="user", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
