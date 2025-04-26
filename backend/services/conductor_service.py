import requests
import json
from typing import Dict, Any, Optional
from ..config.model_routing import ModelRoutingConfig


class ConductorService:
    def __init__(self):
        self.api_key = ModelRoutingConfig.CONDUCTOR_API_KEY
        self.endpoint = ModelRoutingConfig.CONDUCTOR_ENDPOINT
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }

    async def generate_completion(
        self,
        prompt: str,
        use_case: str,
        content_type: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Gera uma conclusão usando o modelo mais adequado para o caso de uso.

        Args:
            prompt: O texto do prompt
            use_case: O caso de uso (vendas, suporte, análise, etc.)
            content_type: O tipo de conteúdo (texto, código, análise)
            temperature: A temperatura para geração
            max_tokens: Número máximo de tokens
            **kwargs: Argumentos adicionais para a API

        Returns:
            Dict com a resposta do modelo
        """
        # Obtém a configuração do modelo mais adequado
        model_config = ModelRoutingConfig.get_model_for_use_case(
            use_case, content_type)

        # Prepara os parâmetros da requisição
        params = {
            'model': model_config['model'],
            'messages': [{'role': 'user', 'content': prompt}],
            'temperature': temperature,
            'max_tokens': max_tokens or model_config['config'].get('max_tokens', 2048),
            **kwargs
        }

        try:
            # Faz a requisição para o Conductor
            response = requests.post(
                self.endpoint,
                headers=self.headers,
                json=params
            )
            response.raise_for_status()

            # Processa a resposta
            result = response.json()

            # Adiciona metadados sobre o modelo usado
            result['model_metadata'] = {
                'model': model_config['model'],
                'use_case': use_case,
                'content_type': content_type,
                'config': model_config['config']
            }

            return result

        except requests.exceptions.RequestException as e:
            # Em caso de erro, tenta o modelo de fallback
            if 'fallback_model' in model_config['config']:
                fallback_model = model_config['config']['fallback_model']
                params['model'] = fallback_model

                try:
                    response = requests.post(
                        self.endpoint,
                        headers=self.headers,
                        json=params
                    )
                    response.raise_for_status()

                    result = response.json()
                    result['model_metadata'] = {
                        'model': fallback_model,
                        'use_case': use_case,
                        'content_type': content_type,
                        'is_fallback': True
                    }

                    return result

                except requests.exceptions.RequestException as e:
                    raise Exception(
                        f"Erro ao usar modelo de fallback: {str(e)}")

            raise Exception(f"Erro ao gerar conclusão: {str(e)}")

    async def stream_completion(
        self,
        prompt: str,
        use_case: str,
        content_type: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        **kwargs
    ):
        """
        Gera uma conclusão em streaming usando o modelo mais adequado.

        Args:
            prompt: O texto do prompt
            use_case: O caso de uso
            content_type: O tipo de conteúdo
            temperature: A temperatura para geração
            max_tokens: Número máximo de tokens
            **kwargs: Argumentos adicionais

        Yields:
            Chunks da resposta do modelo
        """
        model_config = ModelRoutingConfig.get_model_for_use_case(
            use_case, content_type)

        params = {
            'model': model_config['model'],
            'messages': [{'role': 'user', 'content': prompt}],
            'temperature': temperature,
            'max_tokens': max_tokens or model_config['config'].get('max_tokens', 2048),
            'stream': True,
            **kwargs
        }

        try:
            with requests.post(
                self.endpoint,
                headers=self.headers,
                json=params,
                stream=True
            ) as response:
                response.raise_for_status()

                for line in response.iter_lines():
                    if line:
                        try:
                            data = json.loads(line.decode('utf-8'))
                            yield data
                        except json.JSONDecodeError:
                            continue

        except requests.exceptions.RequestException as e:
            if 'fallback_model' in model_config['config']:
                fallback_model = model_config['config']['fallback_model']
                params['model'] = fallback_model

                try:
                    with requests.post(
                        self.endpoint,
                        headers=self.headers,
                        json=params,
                        stream=True
                    ) as response:
                        response.raise_for_status()

                        for line in response.iter_lines():
                            if line:
                                try:
                                    data = json.loads(line.decode('utf-8'))
                                    data['model_metadata'] = {
                                        'model': fallback_model,
                                        'is_fallback': True
                                    }
                                    yield data
                                except json.JSONDecodeError:
                                    continue

                except requests.exceptions.RequestException as e:
                    raise Exception(
                        f"Erro ao usar modelo de fallback: {str(e)}")

            raise Exception(f"Erro ao gerar conclusão em streaming: {str(e)}")

    def get_available_models(self) -> Dict[str, Any]:
        """Retorna informações sobre os modelos disponíveis."""
        return {
            'models': ModelRoutingConfig.get_available_models(),
            'use_cases': ModelRoutingConfig.get_use_cases(),
            'content_types': ModelRoutingConfig.get_content_types()
        }
