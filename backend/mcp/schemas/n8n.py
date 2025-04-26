from pydantic import BaseModel, Field
from typing import Dict, Any, Optional


class WorkflowTrigger(BaseModel):
    data: Dict[str, Any] = Field(...,
                                 description="Dados para acionar o workflow")
    wait_for_completion: bool = Field(
        False, description="Aguardar conclusão da execução")


class WebhookCreate(BaseModel):
    path: str = Field(..., description="Caminho do webhook")
    method: str = Field(..., description="Método HTTP do webhook")
    authentication: Optional[Dict[str, Any]] = Field(
        None, description="Configurações de autenticação")


class WorkflowResponse(BaseModel):
    id: str
    name: str
    active: bool
    nodes: Dict[str, Any]
    connections: Dict[str, Any]


class WebhookResponse(BaseModel):
    id: str
    path: str
    method: str
    authentication: Optional[Dict[str, Any]]
    workflow_id: str
