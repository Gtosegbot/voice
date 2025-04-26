import aiohttp
import asyncio
from typing import Dict, Any, Optional
from ..utils.logger import logger
from ..config import settings

class WebhookService:
    def __init__(self):
        self.session = None
        self.retry_count = 3
        self.retry_delay = 5

    async def _get_session(self):
        if self.session is None:
            self.session = aiohttp.ClientSession()
        return self.session

    async def send_webhook(
        self,
        url: str,
        payload: Dict[str, Any],
        headers: Optional[Dict[str, str]] = None
    ) -> bool:
        session = await self._get_session()
        
        for attempt in range(self.retry_count):
            try:
                async with session.post(
                    url,
                    json=payload,
                    headers=headers or {},
                    timeout=30
                ) as response:
                    if response.status in (200, 201, 202):
                        logger.info(f"Webhook enviado com sucesso para {url}")
                        return True
                    
                    logger.warning(
                        f"Falha ao enviar webhook para {url}. "
                        f"Status: {response.status}, Tentativa: {attempt + 1}"
                    )
                    
                    if attempt < self.retry_count - 1:
                        await asyncio.sleep(self.retry_delay)
                    
            except Exception as e:
                logger.error(
                    f"Erro ao enviar webhook para {url}: {str(e)}. "
                    f"Tentativa: {attempt + 1}"
                )
                if attempt < self.retry_count - 1:
                    await asyncio.sleep(self.retry_delay)
        
        return False

    async def close(self):
        if self.session:
            await self.session.close()
            self.session = None

webhook_service = WebhookService() 