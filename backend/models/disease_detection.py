import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from database import Base

class DiseaseDetection(Base):
    __tablename__ = "disease_detections"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=True)
    image_filename = Column(String(255), nullable=False)
    image_path = Column(String(500), nullable=False)
    disease_class = Column(Integer, nullable=False)  # 0..4 or numeric label
    disease_name = Column(String(120), nullable=False)  # e.g. "Healthy", "Red Rot", "Sugarcane Mosaic"
    confidence_score = Column(Float, nullable=False)  # 0.0 to 1.0 (or percentage)
    severity = Column(String(40), default="None")  # None, Low, Moderate, High, Severe
    description = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    is_demo = Column(Boolean, default=True)  # True if demo mode, False if real trained model
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="disease_detections")
    farm = relationship("Farm", back_populates="disease_detections")
