import aiohttp
import json
from datetime import datetime
from typing import Dict, Any, Optional
from ..utils.logger import logger
from ..config import settings


class BackupService:
    def __init__(self):
        self.session = None
        self.supabase_url = settings.SUPABASE_URL
        self.supabase_key = settings.SUPABASE_KEY
        self.bucket_name = "backups"

    async def _get_session(self):
        if self.session is None:
            self.session = aiohttp.ClientSession()
        return self.session

    async def create_backup(
        self,
        data: Dict[str, Any],
        backup_name: Optional[str] = None
    ) -> Dict[str, Any]:
        session = await self._get_session()

        if not backup_name:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_name = f"backup_{timestamp}.json"

        headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}",
            "Content-Type": "application/json"
        }

        try:
            # 1. Upload do arquivo de backup
            upload_url = f"{self.supabase_url}/storage/v1/object/{self.bucket_name}/{backup_name}"
            async with session.post(
                upload_url,
                data=json.dumps(data),
                headers=headers
            ) as response:
                if response.status != 200:
                    raise Exception("Falha ao fazer upload do backup")
                upload_data = await response.json()

            # 2. Registrar metadados do backup
            metadata_url = f"{self.supabase_url}/rest/v1/backups"
            metadata = {
                "name": backup_name,
                "size": len(json.dumps(data)),
                "created_at": datetime.now().isoformat(),
                "status": "completed",
                "storage_path": upload_data["path"]
            }

            async with session.post(
                metadata_url,
                json=metadata,
                headers=headers
            ) as response:
                if response.status != 201:
                    raise Exception("Falha ao registrar metadados do backup")
                return await response.json()

        except Exception as e:
            logger.error(f"Erro ao criar backup: {str(e)}")
            raise

    async def restore_backup(
        self,
        backup_name: str
    ) -> Dict[str, Any]:
        session = await self._get_session()

        headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}"
        }

        try:
            # 1. Obter metadados do backup
            metadata_url = f"{self.supabase_url}/rest/v1/backups?name=eq.{backup_name}"
            async with session.get(metadata_url, headers=headers) as response:
                if response.status != 200:
                    raise Exception("Falha ao obter metadados do backup")
                metadata = await response.json()
                if not metadata:
                    raise Exception("Backup não encontrado")
                storage_path = metadata[0]["storage_path"]

            # 2. Download do backup
            download_url = f"{self.supabase_url}/storage/v1/object/public/{self.bucket_name}/{storage_path}"
            async with session.get(download_url, headers=headers) as response:
                if response.status != 200:
                    raise Exception("Falha ao fazer download do backup")
                return await response.json()

        except Exception as e:
            logger.error(f"Erro ao restaurar backup: {str(e)}")
            raise

    async def list_backups(
        self,
        limit: int = 10,
        offset: int = 0
    ) -> Dict[str, Any]:
        session = await self._get_session()

        headers = {
            "apikey": self.supabase_key,
            "Authorization": f"Bearer {self.supabase_key}"
        }

        try:
            url = f"{self.supabase_url}/rest/v1/backups?limit={limit}&offset={offset}&order=created_at.desc"
            async with session.get(url, headers=headers) as response:
                if response.status != 200:
                    raise Exception("Falha ao listar backups")
                return await response.json()

        except Exception as e:
            logger.error(f"Erro ao listar backups: {str(e)}")
            raise

    async def close(self):
        if self.session:
            await self.session.close()
            self.session = None


backup_service = BackupService()
