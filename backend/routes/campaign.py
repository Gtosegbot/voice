from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models.campaign import Campaign, CampaignSettings
from ..schemas.campaign import (
    Campaign as CampaignSchema,
    CampaignCreate,
    CampaignUpdate,
    CampaignSettings as CampaignSettingsSchema,
    CampaignSettingsCreate,
    CampaignSettingsUpdate
)

router = APIRouter()


@router.post("/", response_model=CampaignSchema)
def create_campaign(campaign: CampaignCreate, db: Session = Depends(get_db)):
    db_campaign = Campaign(
        name=campaign.name,
        description=campaign.description,
        status="draft"
    )
    db.add(db_campaign)
    db.commit()
    db.refresh(db_campaign)
    return db_campaign


@router.get("/", response_model=List[CampaignSchema])
def list_campaigns(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    campaigns = db.query(Campaign).offset(skip).limit(limit).all()
    return campaigns


@router.get("/{campaign_id}", response_model=CampaignSchema)
def get_campaign(campaign_id: int, db: Session = Depends(get_db)):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if campaign is None:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return campaign


@router.put("/{campaign_id}", response_model=CampaignSchema)
def update_campaign(campaign_id: int, campaign: CampaignUpdate, db: Session = Depends(get_db)):
    db_campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if db_campaign is None:
        raise HTTPException(status_code=404, detail="Campaign not found")

    for field, value in campaign.dict(exclude_unset=True).items():
        setattr(db_campaign, field, value)

    db.commit()
    db.refresh(db_campaign)
    return db_campaign


@router.delete("/{campaign_id}")
def delete_campaign(campaign_id: int, db: Session = Depends(get_db)):
    db_campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if db_campaign is None:
        raise HTTPException(status_code=404, detail="Campaign not found")

    db.delete(db_campaign)
    db.commit()
    return {"message": "Campaign deleted successfully"}


@router.post("/{campaign_id}/settings", response_model=CampaignSettingsSchema)
def create_campaign_settings(
    campaign_id: int,
    settings: CampaignSettingsCreate,
    db: Session = Depends(get_db)
):
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if campaign is None:
        raise HTTPException(status_code=404, detail="Campaign not found")

    db_settings = CampaignSettings(
        campaign_id=campaign_id,
        llm_config=settings.llm_config.dict(),
        voice_config=settings.voice_config.dict(),
        routing_config=settings.routing_config.dict()
    )
    db.add(db_settings)
    db.commit()
    db.refresh(db_settings)
    return db_settings


@router.get("/{campaign_id}/settings", response_model=CampaignSettingsSchema)
def get_campaign_settings(campaign_id: int, db: Session = Depends(get_db)):
    settings = db.query(CampaignSettings).filter(
        CampaignSettings.campaign_id == campaign_id).first()
    if settings is None:
        raise HTTPException(status_code=404, detail="Settings not found")
    return settings


@router.put("/{campaign_id}/settings", response_model=CampaignSettingsSchema)
def update_campaign_settings(
    campaign_id: int,
    settings: CampaignSettingsUpdate,
    db: Session = Depends(get_db)
):
    db_settings = db.query(CampaignSettings).filter(
        CampaignSettings.campaign_id == campaign_id).first()
    if db_settings is None:
        raise HTTPException(status_code=404, detail="Settings not found")

    for field, value in settings.dict(exclude_unset=True).items():
        setattr(db_settings, field, value)

    db.commit()
    db.refresh(db_settings)
    return db_settings
