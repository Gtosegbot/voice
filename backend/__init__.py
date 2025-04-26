"""
VoiceAI Platform - Main application package
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.models.db import Base, engine
from backend.mcp.routes import status

# Criar tabelas
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="VoiceAI Platform",
    description="API para gerenciamento de chamadas e leads",
    version="1.0.0"
)

# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir rotas
app.include_router(status.router)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
