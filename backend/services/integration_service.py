import aiohttp
from typing import Dict, Any, Optional
from ..utils.logger import logger
from ..config import settings


class IntegrationService:
    def __init__(self):
        self.session = None
        self.llm_api_key = settings.LLM_API_KEY
        self.voice_api_key = settings.VOICE_API_KEY

    async def _get_session(self):
        if self.session is None:
            self.session = aiohttp.ClientSession()
        return self.session

    async def call_llm_api(
        self,
        endpoint: str,
        payload: Dict[str, Any],
        headers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        session = await self._get_session()
        url = f"https://api.llm-provider.com/v1/{endpoint}"

        default_headers = {
            "Authorization": f"Bearer {self.llm_api_key}",
            "Content-Type": "application/json"
        }
        if headers:
            default_headers.update(headers)

        try:
            async with session.post(
                url,
                json=payload,
                headers=default_headers,
                timeout=30
            ) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    logger.error(
                        f"Erro na chamada LLM API: {response.status} - "
                        f"{await response.text()}"
                    )
                    raise Exception("Falha na chamada LLM API")
        except Exception as e:
            logger.error(f"Erro ao chamar LLM API: {str(e)}")
            raise

    async def call_voice_api(
        self,
        endpoint: str,
        payload: Dict[str, Any],
        headers: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        session = await self._get_session()
        url = f"https://api.voice-provider.com/v1/{endpoint}"

        default_headers = {
            "Authorization": f"Bearer {self.voice_api_key}",
            "Content-Type": "application/json"
        }
        if headers:
            default_headers.update(headers)

        try:
            async with session.post(
                url,
                json=payload,
                headers=default_headers,
                timeout=30
            ) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    logger.error(
                        f"Erro na chamada Voice API: {response.status} - "
                        f"{await response.text()}"
                    )
                    raise Exception("Falha na chamada Voice API")
        except Exception as e:
            logger.error(f"Erro ao chamar Voice API: {str(e)}")
            raise

    async def close(self):
        if self.session:
            await self.session.close()
            self.session = None


integration_service = IntegrationService()
