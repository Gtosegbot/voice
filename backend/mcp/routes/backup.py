from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional
from ..services.backup_service import backup_service
from ..middleware.auth import get_current_user

router = APIRouter()


@router.post("/create")
async def create_backup(
    data: Dict[str, Any],
    backup_name: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    try:
        result = await backup_service.create_backup(
            data=data,
            backup_name=backup_name
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/restore/{backup_name}")
async def restore_backup(
    backup_name: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    try:
        result = await backup_service.restore_backup(
            backup_name=backup_name
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/list")
async def list_backups(
    limit: int = 10,
    offset: int = 0,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    try:
        result = await backup_service.list_backups(
            limit=limit,
            offset=offset
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
