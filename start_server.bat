@echo off
echo ============================================
echo Iniciando servidor DisparoSeguro...
echo ============================================
echo.

REM Verifica se o Python está instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Python não encontrado. Por favor, instale o Python.
    pause
    exit /b
)

REM Verifica se o arquivo .env existe
if not exist .env (
    echo [ERRO] Arquivo .env não encontrado. Por favor, crie o arquivo .env com as configurações necessárias.
    pause
    exit /b
)

REM Instala as dependências necessárias
echo [INFO] Instalando dependências...
pip install fastapi uvicorn python-dotenv

REM Inicia o servidor
echo.
echo [INFO] Iniciando servidor na porta 5000...
echo [INFO] Acesse: http://127.0.0.1:5000
echo.

REM Executa o servidor
python -m backend.main

echo.
echo [INFO] Servidor encerrado.
echo Pressione qualquer tecla para fechar...
pause 