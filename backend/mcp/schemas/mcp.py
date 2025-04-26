from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class MCPConfig(BaseModel):
    """Configuração do MCP"""
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    version: str
    settings: Dict[str, Any] = {}
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class MCPStatus(BaseModel):
    """Status do MCP"""
    connected: bool = False
    message: str = ""
    last_check: Optional[datetime] = None
    version: str = "1.0.0"
    uptime: Optional[int] = None
    memory_usage: Optional[float] = None
    cpu_usage: Optional[float] = None
