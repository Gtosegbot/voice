from typing import Dict, Any, List, Optional
import httpx
from fastapi import HTTPException
from ..config import settings


class N8nService:
    def __init__(self):
        self.base_url = settings.N8N_BASE_URL
        self.api_key = settings.N8N_API_KEY
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            headers={"X-N8N-API-KEY": self.api_key}
        )

    async def trigger_workflow(
        self,
        workflow_id: str,
        data: Dict[str, Any],
        wait_for_completion: bool = False
    ) -> Dict[str, Any]:
        try:
            response = await self.client.post(
                f"/workflows/{workflow_id}/trigger",
                json={"data": data, "wait_for_completion": wait_for_completion}
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=e.response.status_code if hasattr(
                    e, "response") else 500,
                detail=f"Erro ao acionar workflow: {str(e)}"
            )

    async def list_workflows(self) -> Dict[str, Any]:
        try:
            response = await self.client.get("/workflows")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=e.response.status_code if hasattr(
                    e, "response") else 500,
                detail=f"Erro ao listar workflows: {str(e)}"
            )

    async def create_webhook(
        self,
        workflow_id: str,
        path: str,
        method: str,
        authentication: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        try:
            response = await self.client.post(
                f"/workflows/{workflow_id}/webhooks",
                json={
                    "path": path,
                    "method": method,
                    "authentication": authentication
                }
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=e.response.status_code if hasattr(
                    e, "response") else 500,
                detail=f"Erro ao criar webhook: {str(e)}"
            )

    async def get_execution_status(self, execution_id: str) -> Dict[str, Any]:
        try:
            response = await self.client.get(f"/executions/{execution_id}")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise HTTPException(
                status_code=e.response.status_code if hasattr(
                    e, "response") else 500,
                detail=f"Erro ao obter status da execução: {str(e)}"
            )

    async def close(self):
        await self.client.aclose()


n8n_service = N8nService()
