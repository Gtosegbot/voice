from typing import Dict, Optional
from sqlalchemy.orm import Session
from ..models.campaign_settings import CampaignSettings
from ..config.model_routing import ModelRoutingConfig


class CampaignService:
    def __init__(self, db: Session):
        self.db = db

    def get_campaign_settings(self, campaign_id: int) -> Optional[Dict]:
        """Obtém as configurações de uma campanha."""
        settings = self.db.query(CampaignSettings).filter(
            CampaignSettings.campaign_id == campaign_id
        ).first()

        if not settings:
            return None

        return settings.to_dict()

    def update_campaign_settings(self, campaign_id: int, data: Dict) -> Dict:
        """Atualiza as configurações de uma campanha."""
        settings = self.db.query(CampaignSettings).filter(
            CampaignSettings.campaign_id == campaign_id
        ).first()

        if not settings:
            settings = CampaignSettings(campaign_id=campaign_id)
            self.db.add(settings)

        # Atualiza os campos
        for key, value in data.items():
            if hasattr(settings, key):
                setattr(settings, key, value)

        self.db.commit()
        return settings.to_dict()

    def get_llm_config(self, campaign_id: int) -> Dict:
        """Obtém a configuração de LLM para uma campanha."""
        settings = self.get_campaign_settings(campaign_id)
        if not settings:
            return {
                'provider': 'conductor_auto',
                'model': None,
                'latency_pref': 'medium',
                'max_cost': 0.05
            }

        if settings['llm_provider'] == 'conductor_auto':
            # Usa o roteamento automático do Conductor
            return {
                'provider': 'conductor_auto',
                'latency_pref': settings['llm_latency_pref'],
                'max_cost': settings['llm_max_cost']
            }
        else:
            # Usa o modelo específico definido
            return {
                'provider': settings['llm_provider'],
                'model': settings['llm_model'],
                'latency_pref': settings['llm_latency_pref'],
                'max_cost': settings['llm_max_cost']
            }

    def get_voice_config(self, campaign_id: int) -> Dict:
        """Obtém a configuração de voz para uma campanha."""
        settings = self.get_campaign_settings(campaign_id)
        if not settings:
            return {
                'provider': '11labs',
                'voice_id': None,
                'is_cloned': False,
                'clone_file': None
            }

        return {
            'provider': settings['voice_provider'],
            'voice_id': settings['voice_id'],
            'is_cloned': settings['voice_is_cloned'],
            'clone_file': settings['voice_clone_file']
        }

    def get_available_llms(self) -> Dict:
        """Retorna a lista de LLMs disponíveis."""
        return {
            'auto': {
                'name': 'Auto (Recomendado)',
                'description': 'O Conductor escolhe o melhor modelo automaticamente',
                'value': 'conductor_auto'
            },
            'models': [
                {
                    'name': 'GPT-3.5 Turbo',
                    'description': 'Mais rápido e econômico',
                    'value': 'gpt-3.5-turbo',
                    'provider': 'openai',
                    'latency': 'low',
                    'cost': 'low'
                },
                {
                    'name': 'GPT-4',
                    'description': 'Alta qualidade e precisão',
                    'value': 'gpt-4',
                    'provider': 'openai',
                    'latency': 'medium',
                    'cost': 'high'
                },
                {
                    'name': 'Claude Haiku',
                    'description': 'Baixa latência e boa qualidade',
                    'value': 'claude-3-haiku',
                    'provider': 'anthropic',
                    'latency': 'low',
                    'cost': 'medium'
                },
                {
                    'name': 'Claude Sonnet',
                    'description': 'Equilibrado em qualidade e custo',
                    'value': 'claude-3-sonnet',
                    'provider': 'anthropic',
                    'latency': 'medium',
                    'cost': 'medium'
                }
            ]
        }

    def get_available_voices(self) -> Dict:
        """Retorna a lista de vozes disponíveis por provedor."""
        return {
            '11labs': {
                'name': 'ElevenLabs',
                'description': 'Vozes mais naturais e expressivas',
                'voices': [
                    {'id': 'rachel', 'name': 'Rachel', 'gender': 'female'},
                    {'id': 'dave', 'name': 'Dave', 'gender': 'male'},
                    {'id': 'sarah', 'name': 'Sarah', 'gender': 'female'}
                ]
            },
            'azure': {
                'name': 'Azure',
                'description': 'Vozes equilibradas e confiáveis',
                'voices': [
                    {'id': 'pt-BR-Maria', 'name': 'Maria', 'gender': 'female'},
                    {'id': 'pt-BR-Joao', 'name': 'João', 'gender': 'male'}
                ]
            },
            'google': {
                'name': 'Google',
                'description': 'Vozes rápidas e eficientes',
                'voices': [
                    {'id': 'pt-BR-Wavenet-A', 'name': 'Ana', 'gender': 'female'},
                    {'id': 'pt-BR-Wavenet-B', 'name': 'Pedro', 'gender': 'male'}
                ]
            }
        }
