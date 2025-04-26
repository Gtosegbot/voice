from sqlalchemy import Column, Integer, String, JSON, ForeignKey
from sqlalchemy.orm import relationship
from ..database import Base


class CampaignSettings(Base):
    __tablename__ = "campaign_settings"

    id = Column(Integer, primary_key=True, index=True)
    campaign_id = Column(Integer, ForeignKey("campaigns.id"), unique=True)
    llm_config = Column(JSON, nullable=False)
    voice_config = Column(JSON, nullable=False)
    routing_config = Column(JSON, nullable=False)

    campaign = relationship("Campaign", back_populates="settings")


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    status = Column(String, default="draft")

    settings = relationship(
        "CampaignSettings", back_populates="campaign", uselist=False)
