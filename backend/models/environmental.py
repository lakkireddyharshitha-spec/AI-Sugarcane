import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from database import Base

class EnvironmentalReading(Base):
    __tablename__ = "environmental_readings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False)
    temperature = Column(Float, nullable=False)      # Celsius (e.g. 28.5)
    humidity = Column(Float, nullable=False)         # Percentage (e.g. 75.0)
    rainfall = Column(Float, nullable=False)         # mm (e.g. 12.4)
    soil_moisture = Column(Float, nullable=False)    # Percentage (e.g. 45.0)
    soil_ph = Column(Float, nullable=False)          # pH scale (e.g. 6.8)
    crop_age = Column(Integer, nullable=False)       # Days
    irrigation_status = Column(String(50), nullable=False)  # Active, Inactive, Scheduled
    reading_date = Column(Date, default=datetime.date.today)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="environmental_readings")
    farm = relationship("Farm", back_populates="environmental_readings")
