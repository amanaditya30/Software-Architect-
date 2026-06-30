from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.infrastructure.db.repositories import UserRepository
from app.infrastructure.security.auth_handler import get_password_hash, verify_password, create_access_token
from app.domain.models import UserDomain
from typing import Dict, Any

class AuthUseCase:
    def __init__(self, db: Session):
        self.user_repo = UserRepository(db)

    def register(self, email: str, fullname: str, password: str) -> UserDomain:
        # Check if user already exists
        existing_user = self.user_repo.get_by_email(email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists."
            )
        
        hashed_password = get_password_hash(password)
        return self.user_repo.create(email, fullname, hashed_password)

    def login(self, email: str, password: str) -> Dict[str, Any]:
        user = self.user_repo.get_by_email(email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect email or password."
            )
        
        hashed_password = self.user_repo.get_password_hash(email)
        if not hashed_password or not verify_password(password, hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect email or password."
            )
        
        token = create_access_token(user.email)
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "fullname": user.fullname
            }
        }

    def get_current_user(self, email: str) -> UserDomain:
        user = self.user_repo.get_by_email(email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found."
            )
        return user
