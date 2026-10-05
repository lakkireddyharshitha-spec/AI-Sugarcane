import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(150), nullable=False)
    category = Column(String(50), nullable=False)        # Disease Risk, Environmental Warning, Crop Health
    severity = Column(String(30), nullable=False)        # Low, Medium, High, Critical
    reason = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="alerts")
    farm = relationship("Farm", back_populates="alerts")
