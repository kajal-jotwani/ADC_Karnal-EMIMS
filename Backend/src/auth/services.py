"""
Authentication service layer
Contain logic for user authentication and token management
"""

from fastapi import HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from datetime import datetime, timedelta, timezone
from typing import Optional
import uuid

from src.models.user import User
from src.models.base import Role
from .models import (
    RefreshToken, UserLogin, UserCreate, UserResponse,
    TokenResponse, LoginResponse
)
from .security import security
from src.db.main import get_session
from src.config import Config

class AuthService:

    def __init__(self, session: AsyncSession):
        self.session = session

    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate user by email and password"""

        result = await self.session.exec(
            select(User).where(User.email == email.lower())
        )
        user = result.first()

        if not user or not security.verify_password(password, user.hashed_password):
            return None
        
        if not user.is_active or user.is_deleted:
            return None
        
        return user

    async def create_user_tokens(self, user: User, device_info: Optional[str] = None, ip_address: Optional[str] = None) -> TokenResponse:
        """Create access and refresh tokens for a user"""

        #create access token
        access_token_data = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role.value,
            "first_name": user.first_name,
            "last_name": user.last_name
        }

        access_token = security.create_access_token(access_token_data)

        #create refresh token
        refresh_token_data = {
            "sub": str(user.id)
        }
        refresh_token = security.create_refresh_token(refresh_token_data)

        #extract jti from refresh token to store in db
        refresh_payload = security.verify_token(refresh_token, "refresh")
        jti = refresh_payload.get("jti")

        #store refresh token in db
        db_refresh_token = RefreshToken(
            token=refresh_token,
            jti=jti,
            user_id=user.id,
            expires_at=datetime.now(timezone.utc) + timedelta(days=Config.REFRESH_TOKEN_EXPIRE_DAYS),
            device_info=device_info,
            ip_address=ip_address
        )

        self.session.add(db_refresh_token)

        #update user's last login
        user.last_login = datetime.now(timezone.utc)
        user.updated_at = datetime.now(timezone.utc)
        self.session.add(user)
        await self.session.commit()

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="Bearer",
            expires_in=Config.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
    
    async def login(self, login_data: UserLogin, device_info: Optional[str] = None, ip_address: Optional[str] = None) -> LoginResponse:
        """Handle user login"""

        #authenticate user
        user = await self.authenticate_user(login_data.email, login_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        #create token 
        tokens = await self.create_user_tokens(user, device_info, ip_address)

        #create user response 
        user_response = UserResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            contact_number=user.contact_number,
            role=user.role,
            is_active=user.is_active,
            is_verified=user.is_verified,
            created_at=user.created_at,
            last_login=user.last_login
        )

        return LoginResponse(user=user_response, tokens=tokens)
    
    async def refresh_token(self, refresh_token: str) -> TokenResponse:
        """Refresh access token"""

        #verify referesh token
        try:
            payload = security.verify_token(refresh_token, "refresh")
            user_id_str = payload.get("sub")
            jti = payload.get("jti")

            if user_id_str is None or jti is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid refresh token"
                )
            user_id = uuid.UUID(user_id_str)
        except(HTTPException, ValueError):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )

        #check if refresh token exists and is not revoked
        result = await self.session.exec(
            select(RefreshToken)
            .where(RefreshToken.token == refresh_token)
            .where(RefreshToken.jti == jti)
            .where(RefreshToken.is_revoked == False)
        )
        db_token = result.first()

        if not db_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token not found or revoked"
            )
        
        #get user 
        user = await self.session.get(User, user_id)
        if not user or not user.is_active or user.is_deleted:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        #create new tokens
        new_tokens = await self.create_user_tokens(user, db_token.device_info, db_token.ip_address)

        #revoke old refresh token
        db_token.is_revoked = True
        self.session.add(db_token)
        await self.session.commit()

        return new_tokens
    
    async def logout(self, refresh_token: str) -> bool:
        """Logout user by revoking the refresh token"""

        try:
            #verify referesh token to get jti 
            payload = security.verify_token(refresh_token, "refresh")
            jti = payload.get("jti")

            if jti is None:
                return False
            
        except HTTPException:
            return False

        result = await self.session.exec(
            select(RefreshToken)
            .where(RefreshToken.token == refresh_token)
            .where(RefreshToken.jti == jti)
            .where(RefreshToken.is_revoked == False)
        )
        db_token = result.first()

        if db_token:
            db_token.is_revoked = True
            self.session.add(db_token)
            await self.session.commit()
            return True

        return False
    
    async def create_user(self, user_data: UserCreate) -> UserResponse:
        """Create a new user"""
        
        #check if user alredy exists by email or contact number
        result = await self.session.exec(
            select(User).where(
                (User.email == user_data.email.lower()) | 
                (User.contact_number == user_data.contact_number)
            )
        )
        existing_user = result.first()

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with given email or contact number already exists"
            )
        
        #validate password strength
        if not security.validate_password_strength(user_data.password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password does not meet strength requirements."
            )
        
        #create user 
        hashed_password = security.get_password_hash(user_data.password)
        user = User(
            email=user_data.email.lower(),
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            contact_number=user_data.contact_number,
            hashed_password=hashed_password,
            role=user_data.role
        )

        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)

        return UserResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            contact_number=user.contact_number,
            role=user.role,
            is_active=user.is_active,
            is_verified=user.is_verified,
            created_at=user.created_at,
            last_login=user.last_login
        )

    
