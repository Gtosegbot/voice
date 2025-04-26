import aiohttp
from typing import Dict, Any, Optional
from ..utils.logger import logger
from ..config import settings


class GitHubService:
    def __init__(self):
        self.session = None
        self.github_token = settings.GITHUB_TOKEN
        self.base_url = "https://api.github.com"

    async def _get_session(self):
        if self.session is None:
            self.session = aiohttp.ClientSession()
        return self.session

    async def create_repository(
        self,
        name: str,
        description: Optional[str] = None,
        private: bool = False
    ) -> Dict[str, Any]:
        session = await self._get_session()
        url = f"{self.base_url}/user/repos"

        headers = {
            "Authorization": f"token {self.github_token}",
            "Accept": "application/vnd.github.v3+json"
        }

        payload = {
            "name": name,
            "description": description,
            "private": private
        }

        try:
            async with session.post(url, json=payload, headers=headers) as response:
                if response.status == 201:
                    return await response.json()
                else:
                    logger.error(f"Erro ao criar repositório: {await response.text()}")
                    raise Exception("Falha ao criar repositório")
        except Exception as e:
            logger.error(f"Erro ao criar repositório: {str(e)}")
            raise

    async def push_changes(
        self,
        owner: str,
        repo: str,
        branch: str,
        message: str,
        files: Dict[str, str]
    ) -> bool:
        session = await self._get_session()

        # 1. Obter a referência do branch
        ref_url = f"{self.base_url}/repos/{owner}/{repo}/git/refs/heads/{branch}"
        headers = {
            "Authorization": f"token {self.github_token}",
            "Accept": "application/vnd.github.v3+json"
        }

        try:
            async with session.get(ref_url, headers=headers) as response:
                if response.status != 200:
                    raise Exception("Falha ao obter referência do branch")
                ref_data = await response.json()
                base_tree = ref_data["object"]["sha"]

            # 2. Criar blobs para cada arquivo
            blobs = {}
            for path, content in files.items():
                blob_url = f"{self.base_url}/repos/{owner}/{repo}/git/blobs"
                blob_payload = {
                    "content": content,
                    "encoding": "utf-8"
                }
                async with session.post(blob_url, json=blob_payload, headers=headers) as response:
                    if response.status != 201:
                        raise Exception(f"Falha ao criar blob para {path}")
                    blob_data = await response.json()
                    blobs[path] = blob_data["sha"]

            # 3. Criar nova árvore
            tree_url = f"{self.base_url}/repos/{owner}/{repo}/git/trees"
            tree_payload = {
                "base_tree": base_tree,
                "tree": [
                    {
                        "path": path,
                        "mode": "100644",
                        "type": "blob",
                        "sha": sha
                    }
                    for path, sha in blobs.items()
                ]
            }
            async with session.post(tree_url, json=tree_payload, headers=headers) as response:
                if response.status != 201:
                    raise Exception("Falha ao criar árvore")
                tree_data = await response.json()
                new_tree_sha = tree_data["sha"]

            # 4. Criar commit
            commit_url = f"{self.base_url}/repos/{owner}/{repo}/git/commits"
            commit_payload = {
                "message": message,
                "tree": new_tree_sha,
                "parents": [base_tree]
            }
            async with session.post(commit_url, json=commit_payload, headers=headers) as response:
                if response.status != 201:
                    raise Exception("Falha ao criar commit")
                commit_data = await response.json()
                new_commit_sha = commit_data["sha"]

            # 5. Atualizar referência
            update_ref_url = f"{self.base_url}/repos/{owner}/{repo}/git/refs/heads/{branch}"
            update_ref_payload = {
                "sha": new_commit_sha,
                "force": False
            }
            async with session.patch(update_ref_url, json=update_ref_payload, headers=headers) as response:
                if response.status != 200:
                    raise Exception("Falha ao atualizar referência")
                return True

        except Exception as e:
            logger.error(f"Erro ao fazer push: {str(e)}")
            raise

    async def close(self):
        if self.session:
            await self.session.close()
            self.session = None


github_service = GitHubService()
