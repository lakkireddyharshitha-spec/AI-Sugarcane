import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(50), nullable=False)  # Irrigation Guidance, Crop Monitoring, Environmental Precaution, Disease Prevention
    title = Column(String(150), nullable=False)
    details = Column(Text, nullable=False)
    priority = Column(String(30), default="Medium") # Low, Medium, High, Urgent
    source_context = Column(Text, nullable=True)    # Based on soil moisture, rainfall, stage, etc.
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="recommendations")
    farm = relationship("Farm", back_populates="recommendations")
