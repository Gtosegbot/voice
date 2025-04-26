from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from datetime import datetime, timedelta
from ..config import settings

security = HTTPBearer()


async def get_current_user(request: Request):
    credentials: HTTPAuthorizationCredentials = await security(request)
    if not credentials:
        raise HTTPException(
            status_code=401,
            detail="Credenciais de autenticação não fornecidas",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        token = credentials.credentials
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Token inválido ou expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )


def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )
