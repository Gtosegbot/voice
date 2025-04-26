from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, Optional
from ..services.github_service import github_service
from ..middleware.auth import get_current_user

router = APIRouter()


@router.post("/repositories")
async def create_repository(
    name: str,
    description: Optional[str] = None,
    private: bool = False,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    try:
        result = await github_service.create_repository(
            name=name,
            description=description,
            private=private
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/push")
async def push_changes(
    owner: str,
    repo: str,
    branch: str,
    message: str,
    files: Dict[str, str],
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    try:
        result = await github_service.push_changes(
            owner=owner,
            repo=repo,
            branch=branch,
            message=message,
            files=files
        )
        return {"success": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
