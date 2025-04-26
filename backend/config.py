import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings
from typing import Optional, List

load_dotenv()


class Config:
    # Configurações básicas
    DEBUG = os.getenv('FLASK_DEBUG', '0') == '1'
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here')

    # Configurações de domínio
    DOMAIN = 'disparoseguro.shop'
    API_SUBDOMAIN = f'api.{DOMAIN}'
    WS_SUBDOMAIN = f'ws.{DOMAIN}'
    WEBHOOK_SUBDOMAIN = f'webhooks.{DOMAIN}'
    APP_SUBDOMAIN = f'app.{DOMAIN}'
    CDN_SUBDOMAIN = f'cdn.{DOMAIN}'
    MONITOR_SUBDOMAIN = f'monitor.{DOMAIN}'
    ADMIN_SUBDOMAIN = f'admin.{DOMAIN}'
    DOCS_SUBDOMAIN = f'docs.{DOMAIN}'

    # URLs base
    BASE_URL = f'https://{DOMAIN}'
    API_URL = f'https://{API_SUBDOMAIN}'
    WS_URL = f'wss://{WS_SUBDOMAIN}'
    WEBHOOK_URL = f'https://{WEBHOOK_SUBDOMAIN}'
    APP_URL = f'https://{APP_SUBDOMAIN}'
    CDN_URL = f'https://{CDN_SUBDOMAIN}'
    MONITOR_URL = f'https://{MONITOR_SUBDOMAIN}'
    ADMIN_URL = f'https://{ADMIN_SUBDOMAIN}'
    DOCS_URL = f'https://{DOCS_SUBDOMAIN}'

    # CORS
    CORS_ORIGINS = [
        'http://localhost:5000',
        'http://localhost:3000',
        f'https://{DOMAIN}',
        f'https://www.{DOMAIN}',
        f'https://{APP_SUBDOMAIN}',
        f'https://{ADMIN_SUBDOMAIN}',
        f'https://{MONITOR_SUBDOMAIN}'
    ]

    # Configurações de banco de dados
    DATABASE_URL = os.getenv(
        'DATABASE_URL', 'postgresql://user:pass@localhost:5432/disparoseguro')

    # Configurações de cache
    REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

    # Configurações de email
    SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
    SMTP_USERNAME = os.getenv('SMTP_USERNAME', 'seu-email@gmail.com')
    SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', 'sua-senha')
    EMAIL_FROM = os.getenv('EMAIL_FROM', f'no-reply@{DOMAIN}')

    # Configurações de armazenamento
    STORAGE_BUCKET = os.getenv('STORAGE_BUCKET', 'disparoseguro-files')
    STORAGE_REGION = os.getenv('STORAGE_REGION', 'sa-east-1')

    # Configurações de logging
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('LOG_FILE', 'app.log')

    # Feature flags
    ENABLE_WHATSAPP = os.getenv('ENABLE_WHATSAPP', '1') == '1'
    ENABLE_SMS = os.getenv('ENABLE_SMS', '1') == '1'
    ENABLE_EMAIL = os.getenv('ENABLE_EMAIL', '1') == '1'
    ENABLE_VOICE = os.getenv('ENABLE_VOICE', '1') == '1'
    ENABLE_CHAT = os.getenv('ENABLE_CHAT', '1') == '1'


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


class TestingConfig(Config):
    TESTING = True
    DEBUG = True


class Settings(BaseSettings):
    # Configurações do Banco de Dados
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "sqlite:///./disparoseguro.db")

    # Configurações de Segurança
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-here")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Configurações de CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000", "http://localhost:8000"]

    # Configurações de Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE: str = os.getenv("LOG_FILE", "backend.log")

    # Configurações de WebSocket
    WS_MAX_CONNECTIONS: int = 100
    WS_PING_INTERVAL: int = 20
    WS_PING_TIMEOUT: int = 20

    # Configurações de Integração
    LLM_API_KEY: Optional[str] = os.getenv("LLM_API_KEY")
    VOICE_API_KEY: Optional[str] = os.getenv("VOICE_API_KEY")

    # Configurações do GitHub
    GITHUB_TOKEN: Optional[str] = os.getenv("GITHUB_TOKEN")

    # Configurações do Supabase
    SUPABASE_URL: Optional[str] = os.getenv("SUPABASE_URL")
    SUPABASE_KEY: Optional[str] = os.getenv("SUPABASE_KEY")

    # Configurações de Domínio
    DOMAIN: str = os.getenv("DOMAIN", "disparoseguro.shop")
    API_SUBDOMAIN: str = f"api.{DOMAIN}"
    WS_SUBDOMAIN: str = f"ws.{DOMAIN}"
    WEBHOOK_SUBDOMAIN: str = f"webhooks.{DOMAIN}"
    APP_SUBDOMAIN: str = f"app.{DOMAIN}"
    CDN_SUBDOMAIN: str = f"cdn.{DOMAIN}"
    MONITOR_SUBDOMAIN: str = f"monitor.{DOMAIN}"
    ADMIN_SUBDOMAIN: str = f"admin.{DOMAIN}"
    DOCS_SUBDOMAIN: str = f"docs.{DOMAIN}"

    # URLs base
    BASE_URL: str = f"https://{DOMAIN}"
    API_URL: str = f"https://{API_SUBDOMAIN}"
    WS_URL: str = f"wss://{WS_SUBDOMAIN}"
    WEBHOOK_URL: str = f"https://{WEBHOOK_SUBDOMAIN}"
    APP_URL: str = f"https://{APP_SUBDOMAIN}"
    CDN_URL: str = f"https://{CDN_SUBDOMAIN}"
    MONITOR_URL: str = f"https://{MONITOR_SUBDOMAIN}"
    ADMIN_URL: str = f"https://{ADMIN_SUBDOMAIN}"
    DOCS_URL: str = f"https://{DOCS_SUBDOMAIN}"

    # Configurações de Cache
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

    # Configurações de Email
    SMTP_SERVER: str = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USERNAME: str = os.getenv("SMTP_USERNAME", "seu-email@gmail.com")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD", "sua-senha")
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", f"no-reply@{DOMAIN}")

    # Configurações de Armazenamento
    STORAGE_BUCKET: str = os.getenv("STORAGE_BUCKET", "disparoseguro-files")
    STORAGE_REGION: str = os.getenv("STORAGE_REGION", "sa-east-1")

    # Feature flags
    ENABLE_WHATSAPP: bool = os.getenv("ENABLE_WHATSAPP", "1") == "1"
    ENABLE_SMS: bool = os.getenv("ENABLE_SMS", "1") == "1"
    ENABLE_EMAIL: bool = os.getenv("ENABLE_EMAIL", "1") == "1"
    ENABLE_VOICE: bool = os.getenv("ENABLE_VOICE", "1") == "1"
    ENABLE_CHAT: bool = os.getenv("ENABLE_CHAT", "1") == "1"

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
