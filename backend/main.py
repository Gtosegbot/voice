from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
from pathlib import Path
import os
import socket
from .mcp.routes import status
from .config import settings

app = FastAPI(
    title="DisparoSeguro API",
    description="API para gerenciamento de disparos de mensagens",
    version="1.0.0"
)

# Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite todas as origens em desenvolvimento
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Montar arquivos estáticos
frontend_path = Path(__file__).parent.parent / "frontend"
app.mount("/static", StaticFiles(directory=str(frontend_path)), name="static")

# Incluir rotas
app.include_router(status.router)


@app.get("/", response_class=HTMLResponse)
async def read_root():
    index_path = frontend_path / "index.html"
    if not index_path.exists():
        return HTMLResponse(content="<h1>Arquivo index.html não encontrado</h1>", status_code=404)

    with open(index_path, "r", encoding="utf-8") as f:
        html_content = f.read()
    return HTMLResponse(content=html_content)


@app.get("/{path:path}", response_class=HTMLResponse)
async def serve_static(path: str):
    file_path = frontend_path / path
    if file_path.exists():
        if file_path.suffix == ".html":
            with open(file_path, "r", encoding="utf-8") as f:
                return HTMLResponse(content=f.read())
        return FileResponse(file_path)
    return HTMLResponse(content="<h1>Arquivo não encontrado</h1>", status_code=404)

if __name__ == "__main__":
    import uvicorn
    print("Iniciando servidor...")
    print(f"Diretório atual: {os.getcwd()}")
    print(f"Caminho do frontend: {frontend_path}")

    # Usando porta fixa 5000
    port = 5000
    print(f"Usando porta: {port}")

    uvicorn.run(
        "backend.main:app",
        host="127.0.0.1",
        port=port,
        reload=True,
        log_level="debug"
    )
