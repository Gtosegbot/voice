from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .routes import campaign
from .mcp import router as mcp_router
from .config import settings
import logging
import os

# Configuração de logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="DisparoSeguro API",
    description="API para gerenciamento de campanhas de voz",
    version="1.0.0"
)

# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuração de arquivos estáticos
app.mount("/static", StaticFiles(directory="static"), name="static")

# Registro dos routers
app.include_router(campaign.router, prefix="/api/campaigns",
                   tags=["campaigns"])
app.include_router(mcp_router, prefix="/api/mcp", tags=["mcp"])


@app.get("/")
async def root():
    return {
        "service": "DisparoSeguro API",
        "status": "running",
        "version": "1.0.0",
        "documentation": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Configuração de variáveis de ambiente
PORT = int(os.environ.get("PORT", 8000))
DEBUG = os.environ.get("DEBUG", "False").lower() == "true"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT, debug=DEBUG)
