from typing import Dict, List, Optional
import os
from dotenv import load_dotenv

load_dotenv()


class ModelRoutingConfig:
    # Configurações do Conductor (Arcee AI)
    CONDUCTOR_API_KEY = os.getenv('CONDUCTOR_API_KEY')
    CONDUCTOR_ENDPOINT = os.getenv(
        'CONDUCTOR_ENDPOINT', 'https://conductor.arcee.ai/openai/v1/chat/completions')

    # Configurações de modelos disponíveis
    AVAILABLE_MODELS = {
        'gpt-4': {
            'provider': 'openai',
            'max_tokens': 8192,
            'cost_per_token': 0.00003,
            'latency': 'medium',
            'capabilities': ['chat', 'analysis', 'code']
        },
        'gpt-3.5-turbo': {
            'provider': 'openai',
            'max_tokens': 4096,
            'cost_per_token': 0.000002,
            'latency': 'fast',
            'capabilities': ['chat', 'analysis']
        },
        'claude-3-opus': {
            'provider': 'anthropic',
            'max_tokens': 200000,
            'cost_per_token': 0.000015,
            'latency': 'medium',
            'capabilities': ['analysis', 'reasoning']
        },
        'claude-3-sonnet': {
            'provider': 'anthropic',
            'max_tokens': 200000,
            'cost_per_token': 0.000003,
            'latency': 'fast',
            'capabilities': ['chat', 'analysis']
        },
        'gemini-pro': {
            'provider': 'google',
            'max_tokens': 32768,
            'cost_per_token': 0.000001,
            'latency': 'fast',
            'capabilities': ['chat', 'analysis']
        },
        'mistral-large': {
            'provider': 'mistral',
            'max_tokens': 32768,
            'cost_per_token': 0.000008,
            'latency': 'medium',
            'capabilities': ['chat', 'analysis']
        }
    }

    # Configurações de roteamento por caso de uso
    USE_CASE_ROUTING = {
        'vendas': {
            'primary_model': 'gpt-4',
            'fallback_model': 'claude-3-sonnet',
            'max_cost': 0.05,
            'latency_requirement': 'medium',
            'required_capabilities': ['chat', 'analysis']
        },
        'suporte': {
            'primary_model': 'claude-3-sonnet',
            'fallback_model': 'gpt-3.5-turbo',
            'max_cost': 0.02,
            'latency_requirement': 'fast',
            'required_capabilities': ['chat']
        },
        'análise': {
            'primary_model': 'claude-3-opus',
            'fallback_model': 'gpt-4',
            'max_cost': 0.1,
            'latency_requirement': 'medium',
            'required_capabilities': ['analysis', 'reasoning']
        },
        'geral': {
            'primary_model': 'gpt-3.5-turbo',
            'fallback_model': 'gemini-pro',
            'max_cost': 0.01,
            'latency_requirement': 'fast',
            'required_capabilities': ['chat']
        }
    }

    # Configurações de roteamento por tipo de conteúdo
    CONTENT_TYPE_ROUTING = {
        'texto': {
            'preferred_models': ['gpt-4', 'claude-3-sonnet'],
            'max_tokens': 4096
        },
        'código': {
            'preferred_models': ['gpt-4', 'claude-3-opus'],
            'max_tokens': 8192
        },
        'análise': {
            'preferred_models': ['claude-3-opus', 'gpt-4'],
            'max_tokens': 16384
        }
    }

    @classmethod
    def get_model_for_use_case(cls, use_case: str, content_type: Optional[str] = None) -> Dict:
        """Retorna a configuração do modelo mais adequado para um caso de uso específico."""
        use_case_config = cls.USE_CASE_ROUTING.get(
            use_case, cls.USE_CASE_ROUTING['geral'])

        if content_type and content_type in cls.CONTENT_TYPE_ROUTING:
            content_config = cls.CONTENT_TYPE_ROUTING[content_type]
            # Verifica se os modelos preferidos do tipo de conteúdo atendem aos requisitos do caso de uso
            for model in content_config['preferred_models']:
                if model in cls.AVAILABLE_MODELS:
                    model_config = cls.AVAILABLE_MODELS[model]
                    if all(cap in model_config['capabilities'] for cap in use_case_config['required_capabilities']):
                        return {
                            'model': model,
                            'config': {**model_config, **use_case_config}
                        }

        # Se não encontrar um modelo específico para o tipo de conteúdo, usa a configuração padrão do caso de uso
        primary_model = use_case_config['primary_model']
        if primary_model in cls.AVAILABLE_MODELS:
            return {
                'model': primary_model,
                'config': {**cls.AVAILABLE_MODELS[primary_model], **use_case_config}
            }

        # Fallback para o modelo geral
        return {
            'model': 'gpt-3.5-turbo',
            'config': {**cls.AVAILABLE_MODELS['gpt-3.5-turbo'], **cls.USE_CASE_ROUTING['geral']}
        }

    @classmethod
    def get_available_models(cls) -> List[str]:
        """Retorna lista de modelos disponíveis."""
        return list(cls.AVAILABLE_MODELS.keys())

    @classmethod
    def get_use_cases(cls) -> List[str]:
        """Retorna lista de casos de uso configurados."""
        return list(cls.USE_CASE_ROUTING.keys())

    @classmethod
    def get_content_types(cls) -> List[str]:
        """Retorna lista de tipos de conteúdo configurados."""
        return list(cls.CONTENT_TYPE_ROUTING.keys())
