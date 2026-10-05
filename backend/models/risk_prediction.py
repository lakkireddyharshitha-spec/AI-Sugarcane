import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from database import Base

class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    rainfall = Column(Float, nullable=False)
    soil_moisture = Column(Float, nullable=False)
    soil_ph = Column(Float, nullable=False)
    crop_age = Column(Integer, nullable=False)
    risk_level = Column(String(50), nullable=False)      # Low Risk, Medium Risk, High Risk
    risk_score = Column(Float, nullable=False)          # 0 to 100 percentage
    risk_explanation = Column(Text, nullable=False)
    contributing_factors = Column(Text, nullable=False) # JSON string or descriptive text
    suggestions = Column(Text, nullable=False)          # Actionable preventive practices
    model_used = Column(String(100), default="Rule-Based Expert System (DEMO)")
    is_demo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="risk_predictions")
    farm = relationship("Farm", back_populates="risk_predictions")
