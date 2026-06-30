from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.infrastructure.db.database import get_db
from app.interfaces.schemas.user import UserCreate, UserLogin, TokenResponse, UserResponse
from app.use_cases.auth import AuthUseCase
from app.infrastructure.security.auth_handler import decode_access_token
from app.domain.models import UserDomain

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

def get_current_user_dependency(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> UserDomain:
    token = credentials.credentials
    email = decode_access_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    auth_use_case = AuthUseCase(db)
    return auth_use_case.get_current_user(email)

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    auth_use_case = AuthUseCase(db)
    return auth_use_case.register(user_in.email, user_in.fullname, user_in.password)

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    auth_use_case = AuthUseCase(db)
    return auth_use_case.login(credentials.email, credentials.password)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: UserDomain = Depends(get_current_user_dependency)):
    return current_user
