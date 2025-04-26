import aiohttp
from typing import Dict, Any, Optional, List
from ..utils.logger import logger
from ..config import settings


class N8nService:
    def __init__(self):
        self.session = None
        self.n8n_url = settings.N8N_URL
        self.n8n_api_key = settings.N8N_API_KEY

    async def _get_session(self):
        if self.session is None:
            self.session = aiohttp.ClientSession()
        return self.session

    async def trigger_workflow(
        self,
        workflow_id: str,
        data: Dict[str, Any],
        wait_for_completion: bool = False
    ) -> Dict[str, Any]:
        session = await self._get_session()

        headers = {
            "X-N8N-API-KEY": self.n8n_api_key,
            "Content-Type": "application/json"
        }

        try:
            async with session.post(
                f"{self.n8n_url}/webhook/{workflow_id}",
                json=data,
                headers=headers
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    if wait_for_completion:
                        # Aguardar conclusão do workflow
                        execution_id = result.get("executionId")
                        if execution_id:
                            return await self.get_execution_status(execution_id)
                    return result
                else:
                    logger.error(f"Erro ao acionar workflow: {await response.text()}")
                    raise Exception("Falha ao acionar workflow")
        except Exception as e:
            logger.error(f"Erro ao acionar workflow: {str(e)}")
            raise

    async def get_execution_status(
        self,
        execution_id: str
    ) -> Dict[str, Any]:
        session = await self._get_session()

        headers = {
            "X-N8N-API-KEY": self.n8n_api_key
        }

        try:
            async with session.get(
                f"{self.n8n_url}/executions/{execution_id}",
                headers=headers
            ) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    logger.error(f"Erro ao obter status: {await response.text()}")
                    raise Exception("Falha ao obter status da execução")
        except Exception as e:
            logger.error(f"Erro ao obter status: {str(e)}")
            raise

    async def get_workflows(self) -> List[Dict[str, Any]]:
        session = await self._get_session()

        headers = {
            "X-N8N-API-KEY": self.n8n_api_key
        }

        try:
            async with session.get(
                f"{self.n8n_url}/workflows",
                headers=headers
            ) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    logger.error(f"Erro ao obter workflows: {await response.text()}")
                    raise Exception("Falha ao obter workflows")
        except Exception as e:
            logger.error(f"Erro ao obter workflows: {str(e)}")
            raise

    async def create_webhook(
        self,
        workflow_id: str,
        path: str,
        method: str = "POST",
        authentication: Optional[str] = None
    ) -> Dict[str, Any]:
        session = await self._get_session()

        headers = {
            "X-N8N-API-KEY": self.n8n_api_key,
            "Content-Type": "application/json"
        }

        payload = {
            "path": path,
            "method": method,
            "authentication": authentication
        }

        try:
            async with session.post(
                f"{self.n8n_url}/workflows/{workflow_id}/webhooks",
                json=payload,
                headers=headers
            ) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    logger.error(f"Erro ao criar webhook: {await response.text()}")
                    raise Exception("Falha ao criar webhook")
        except Exception as e:
            logger.error(f"Erro ao criar webhook: {str(e)}")
            raise

    async def close(self):
        if self.session:
            await self.session.close()
            self.session = None


n8n_service = N8nService()
