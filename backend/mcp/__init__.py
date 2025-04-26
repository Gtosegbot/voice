from fastapi import APIRouter
from .routes import github, backup, monitoring, settings

router = APIRouter(prefix="/mcp", tags=["mcp"])

# Registro dos sub-routers
router.include_router(github.router, prefix="/github", tags=["github"])
router.include_router(backup.router, prefix="/backup", tags=["backup"])
router.include_router(
    monitoring.router, prefix="/monitoring", tags=["monitoring"])
router.include_router(settings.router, prefix="/settings", tags=["settings"])
