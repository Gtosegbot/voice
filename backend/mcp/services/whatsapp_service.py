import aiohttp
from typing import Dict, Any, Optional, List
from ..utils.logger import logger
from ..config import settings


class WhatsAppService:
    def __init__(self):
        self.session = None
        self.whatsapp_token = settings.WHATSAPP_TOKEN
        self.base_url = "https://graph.facebook.com/v17.0"

    async def _get_session(self):
        if self.session is None:
            self.session = aiohttp.ClientSession()
        return self.session

    async def send_message(
        self,
        phone_number: str,
        message: str,
        template_name: Optional[str] = None,
        template_params: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        session = await self._get_session()

        headers = {
            "Authorization": f"Bearer {self.whatsapp_token}",
            "Content-Type": "application/json"
        }

        payload = {
            "messaging_product": "whatsapp",
            "to": phone_number,
            "type": "text",
            "text": {"body": message}
        }

        if template_name:
            payload["type"] = "template"
            payload["template"] = {
                "name": template_name,
                "language": {"code": "pt_BR"},
                "components": [
                    {
                        "type": "body",
                        "parameters": [
                            {"type": "text", "text": value}
                            for value in template_params.values()
                        ]
                    }
                ]
            }

        try:
            async with session.post(
                f"{self.base_url}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages",
                json=payload,
                headers=headers
            ) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    logger.error(f"Erro ao enviar mensagem: {await response.text()}")
                    raise Exception("Falha ao enviar mensagem")
        except Exception as e:
            logger.error(f"Erro ao enviar mensagem: {str(e)}")
            raise

    async def send_media(
        self,
        phone_number: str,
        media_url: str,
        media_type: str,
        caption: Optional[str] = None
    ) -> Dict[str, Any]:
        session = await self._get_session()

        headers = {
            "Authorization": f"Bearer {self.whatsapp_token}",
            "Content-Type": "application/json"
        }

        payload = {
            "messaging_product": "whatsapp",
            "to": phone_number,
            "type": media_type,
            media_type: {
                "link": media_url
            }
        }

        if caption:
            payload[media_type]["caption"] = caption

        try:
            async with session.post(
                f"{self.base_url}/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages",
                json=payload,
                headers=headers
            ) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    logger.error(f"Erro ao enviar mídia: {await response.text()}")
                    raise Exception("Falha ao enviar mídia")
        except Exception as e:
            logger.error(f"Erro ao enviar mídia: {str(e)}")
            raise

    async def get_templates(self) -> List[Dict[str, Any]]:
        session = await self._get_session()

        headers = {
            "Authorization": f"Bearer {self.whatsapp_token}"
        }

        try:
            async with session.get(
                f"{self.base_url}/{settings.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates",
                headers=headers
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get("data", [])
                else:
                    logger.error(f"Erro ao obter templates: {await response.text()}")
                    raise Exception("Falha ao obter templates")
        except Exception as e:
            logger.error(f"Erro ao obter templates: {str(e)}")
            raise

    async def close(self):
        if self.session:
            await self.session.close()
            self.session = None


whatsapp_service = WhatsAppService()
