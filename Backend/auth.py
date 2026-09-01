import bcrypt
from jose import jwt
from datetime import datetime, timedelta


SECRET_KEY = "air-quality-prediction-secret-key-change-later"
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")

    salt = bcrypt.gensalt()

    hashed = bcrypt.hashpw(password_bytes, salt)

    return hashed.decode("utf-8")


def verify_password(password: str, hashed_password: str) -> bool:
    password_bytes = password.encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")

    return bcrypt.checkpw(password_bytes, hashed_bytes)


def create_access_token(user_id: int):
    expire = datetime.utcnow() + timedelta(hours=24)

    payload = {
        "sub": str(user_id),
        "exp": expire
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# JWT dependencies for FastAPI
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from models import User

security = HTTPBearer(auto_error=False)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)) -> User:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = int(user_id_str)
    except Exception:
        raise credentials_exception
        
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user


def get_optional_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return None
    try:
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return None
        token = parts[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id_str = payload.get("sub")
        if not user_id_str:
            return None
        user_id = int(user_id_str)
        return db.query(User).filter(User.id == user_id).first()
    except Exception:
        return None