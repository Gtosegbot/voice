from typing import Dict, Optional
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, JSON
from ..database import Base


class CampaignSettings(Base):
    __tablename__ = 'campaign_settings'

    id = Column(Integer, primary_key=True)
    campaign_id = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow,
                        onupdate=datetime.utcnow)

    # Configurações de LLM
    # conductor_auto, gpt-4, claude-3, etc.
    llm_provider = Column(String, default='conductor_auto')
    # Modelo específico se não for auto
    llm_model = Column(String, nullable=True)
    llm_latency_pref = Column(String, default='medium')  # low, medium, high
    # Custo máximo por chamada em USD
    llm_max_cost = Column(Float, default=0.05)

    # Configurações de Voz
    voice_provider = Column(String, default='11labs')  # 11labs, azure, google
    voice_id = Column(String, nullable=True)  # ID da voz específica
    voice_is_cloned = Column(Boolean, default=False)
    # URL do arquivo de clonagem
    voice_clone_file = Column(String, nullable=True)

    # Configurações de Chamada
    max_retries = Column(Integer, default=3)
    retry_delay = Column(Integer, default=300)  # segundos
    max_duration = Column(Integer, default=300)  # segundos

    # Configurações de Qualidade
    # Confiança mínima para transcrição
    min_confidence = Column(Float, default=0.8)
    enable_sentiment = Column(Boolean, default=True)
    enable_topics = Column(Boolean, default=True)

    # Configurações de Fallback
    fallback_llm = Column(String, default='gpt-3.5-turbo')
    fallback_voice = Column(String, default='azure')

    # Metadados
    metadata = Column(JSON, default={})

    def to_dict(self) -> Dict:
        return {
            'id': self.id,
            'campaign_id': self.campaign_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
            'llm_provider': self.llm_provider,
            'llm_model': self.llm_model,
            'llm_latency_pref': self.llm_latency_pref,
            'llm_max_cost': self.llm_max_cost,
            'voice_provider': self.voice_provider,
            'voice_id': self.voice_id,
            'voice_is_cloned': self.voice_is_cloned,
            'voice_clone_file': self.voice_clone_file,
            'max_retries': self.max_retries,
            'retry_delay': self.retry_delay,
            'max_duration': self.max_duration,
            'min_confidence': self.min_confidence,
            'enable_sentiment': self.enable_sentiment,
            'enable_topics': self.enable_topics,
            'fallback_llm': self.fallback_llm,
            'fallback_voice': self.fallback_voice,
            'metadata': self.metadata
        }

    @classmethod
    def from_dict(cls, data: Dict) -> 'CampaignSettings':
        settings = cls()
        for key, value in data.items():
            if hasattr(settings, key):
                setattr(settings, key, value)
        return settings
