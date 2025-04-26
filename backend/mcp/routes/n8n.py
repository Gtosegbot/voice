from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, Optional
from ..services.n8n import N8nService
from ..schemas.n8n import (
    WorkflowTrigger,
    WebhookCreate,
    WorkflowResponse,
    WebhookResponse
)

router = APIRouter(prefix="/n8n", tags=["n8n"])

async def get_n8n_service() -> N8nService:
    service = N8nService()
    try:
        yield service
    finally:
        await service.close()

@router.post("/workflows/{workflow_id}/trigger", response_model=Dict[str, Any])
async def trigger_workflow(
    workflow_id: str,
    trigger: WorkflowTrigger,
    service: N8nService = Depends(get_n8n_service)
):
    return await service.trigger_workflow(
        workflow_id=workflow_id,
        data=trigger.data,
        wait_for_completion=trigger.wait_for_completion
    )

@router.get("/workflows", response_model=Dict[str, Any])
async def list_workflows(service: N8nService = Depends(get_n8n_service)):
    return await service.list_workflows()

@router.post("/workflows/{workflow_id}/webhooks", response_model=WebhookResponse)
async def create_webhook(
    workflow_id: str,
    webhook: WebhookCreate,
    service: N8nService = Depends(get_n8n_service)
):
    result = await service.create_webhook(
        workflow_id=workflow_id,
        path=webhook.path,
        method=webhook.method,
        authentication=webhook.authentication
    )
    return WebhookResponse(**result)

@router.get("/executions/{execution_id}", response_model=Dict[str, Any])
async def get_execution_status(
    execution_id: str,
    service: N8nService = Depends(get_n8n_service)
):
    return await service.get_execution_status(execution_id)
