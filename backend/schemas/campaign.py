from pydantic import BaseModel
from typing import Optional, Dict, Any


class LLMConfig(BaseModel):
    model: str
    temperature: float = 0.7
    max_tokens: int = 150
    system_prompt: str
    parameters: Optional[Dict[str, Any]] = None


class VoiceConfig(BaseModel):
    voice_id: str
    language: str
    speed: float = 1.0
    pitch: float = 1.0
    parameters: Optional[Dict[str, Any]] = None


class RoutingConfig(BaseModel):
    max_retries: int = 3
    retry_delay: int = 60
    fallback_number: Optional[str] = None
    business_hours: Dict[str, Any]


class CampaignSettingsBase(BaseModel):
    llm_config: LLMConfig
    voice_config: VoiceConfig
    routing_config: RoutingConfig


class CampaignSettingsCreate(CampaignSettingsBase):
    pass


class CampaignSettingsUpdate(CampaignSettingsBase):
    pass


class CampaignSettings(CampaignSettingsBase):
    id: int
    campaign_id: int

    class Config:
        orm_mode = True


class CampaignBase(BaseModel):
    name: str
    description: Optional[str] = None


class CampaignCreate(CampaignBase):
    pass


class CampaignUpdate(CampaignBase):
    status: Optional[str] = None


class Campaign(CampaignBase):
    id: int
    status: str
    settings: Optional[CampaignSettings] = None

    class Config:
        orm_mode = True
