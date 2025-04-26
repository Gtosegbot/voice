from fastapi import APIRouter
from datetime import datetime
from typing import Dict

router = APIRouter(prefix="/status", tags=["status"])


@router.get("/", response_model=Dict[str, str])
async def get_status() -> Dict[str, str]:
    return {
        "status": "online",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }
