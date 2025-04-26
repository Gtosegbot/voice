from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from ..schemas.mcp import MCPConfig, MCPStatus
from ..services.mcp import MCPManager
from ...config.supabase import supabase

router = APIRouter(prefix="/mcp", tags=["mcp"])

# Dependência para obter o gerenciador MCP


async def get_mcp_manager() -> MCPManager:
    return MCPManager(supabase)


@router.get("/status", response_model=MCPStatus)
async def get_mcp_status(mcp_manager: MCPManager = Depends(get_mcp_manager)):
    """Obtém o status atual do MCP"""
    try:
        status = await mcp_manager.get_status()
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/config", response_model=MCPConfig)
async def get_mcp_config(mcp_manager: MCPManager = Depends(get_mcp_manager)):
    """Obtém a configuração atual do MCP"""
    try:
        config = await mcp_manager.get_config()
        return config
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/config", response_model=MCPConfig)
async def update_mcp_config(
    config: MCPConfig,
    mcp_manager: MCPManager = Depends(get_mcp_manager)
):
    """Atualiza a configuração do MCP"""
    try:
        updated_config = await mcp_manager.update_config(config)
        return updated_config
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/tables/create")
async def create_tables(mcp_manager: MCPManager = Depends(get_mcp_manager)):
    """Cria todas as tabelas necessárias no Supabase"""
    try:
        await mcp_manager.create_tables()
        return {"message": "Tabelas criadas com sucesso"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
