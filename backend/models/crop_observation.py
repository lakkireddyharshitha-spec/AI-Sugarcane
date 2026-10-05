import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Date, Text
from sqlalchemy.orm import relationship
from database import Base

class CropObservation(Base):
    __tablename__ = "crop_observations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False)
    observation_date = Column(Date, default=datetime.date.today, nullable=False)
    crop_age = Column(Integer, nullable=False)           # Days from planting
    plant_height = Column(Float, nullable=False)        # cm
    growth_stage = Column(String(80), nullable=False)   # Germination, Tillering, Grand Growth, Ripening
    leaf_condition = Column(String(80), nullable=False) # Vibrant Green, Slight Yellowing, Spotted, Wilting
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="crop_observations")
    farm = relationship("Farm", back_populates="crop_observations")
