#!/usr/bin/env python
"""
Script para iniciar todos os componentes do DisparoSeguro
"""

import subprocess
import sys
import os
import signal
import time
import webbrowser
from pathlib import Path

# Lista de processos
processes = []

def start_services():
    """Inicia todos os serviços necessários"""
    # Verificar se as pastas e arquivos existem
    frontend_dir = Path("frontend")
    backend_dir = Path("backend")
    
    if not frontend_dir.exists() or not backend_dir.exists():
        print("Erro: Estrutura de diretórios incompleta. Verifique se as pastas 'frontend' e 'backend' existem.")
        sys.exit(1)
    
    # Frontend
    print("Iniciando servidor frontend...")
    frontend = subprocess.Popen(
        ["python", "-m", "http.server", "5000"], 
        cwd="frontend"
    )
    processes.append(frontend)
    
    # Backend API (se existir)
    if (backend_dir / "app.py").exists():
        print("Iniciando servidor backend...")
        backend = subprocess.Popen(
            ["python", "app.py"], 
            cwd="backend"
        )
        processes.append(backend)
    
    # WebSocket server
    if (backend_dir / "ws_server.py").exists():
        print("Iniciando servidor WebSocket...")
        ws_server = subprocess.Popen(
            ["python", "ws_server.py"], 
            cwd="backend"
        )
        processes.append(ws_server)
    
    print("\nServiços iniciados:")
    print("- Frontend: http://localhost:5000")
    print("- Backend API: http://localhost:5001 (se disponível)")
    print("- WebSocket: ws://localhost:8765")
    print("\nPressione Ctrl+C para encerrar todos os serviços")
    
    # Abrir o navegador automaticamente
    time.sleep(2)  # Aguardar os serviços iniciarem
    webbrowser.open("http://localhost:5000")

def stop_services():
    """Para todos os serviços em execução"""
    print("\nEncerrando serviços...")
    for process in processes:
        if process.poll() is None:  # Se o processo ainda estiver em execução
            process.terminate()
            process.wait()
    print("Todos os serviços foram encerrados.")

if __name__ == "__main__":
    try:
        start_services()
        # Mantém o script em execução
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        stop_services()
        sys.exit(0)
