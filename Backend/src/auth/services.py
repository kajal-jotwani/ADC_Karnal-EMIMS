"""
Authentication service layer
Contain logic for user authentication and token management
"""

from fastapi import Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta, timezone
from typing import Optional
import traceback

from .models import (
    User, UserRole, RefreshToken, UserLogin, UserCreate, UserResponse,
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
            select(User).options(selectinload(User.school)).where(User.email == email.lower())
        )
        user = result.first()

        if not user or not security.verify_password(password, user.hashed_password):
            return None
        
        if not user.is_active:
            return None
        
        return user

    async def create_user_tokens(self, user: User, device_info: Optional[str] = None, ip_address: Optional[str] = None) -> TokenResponse:
        """Create access and refresh tokens for a user"""
    
        try:
            # Create access token
            access_token_data = {
                "sub": str(user.id),
                "email": user.email,
                "role": user.role.value,
                "first_name": user.first_name,
                "last_name": user.last_name
            }

            access_token = security.create_access_token(access_token_data)

            # Create refresh token
            refresh_token_data = {
                "sub": str(user.id)
            }
            refresh_token = security.create_refresh_token(refresh_token_data)

        # Extract jti from refresh token to store in db
            refresh_payload = security.verify_token(refresh_token, "refresh")
            jti = refresh_payload.get("jti")

        # Validate jti exists
            if not jti:
                raise ValueError("Failed to extract JTI from refresh token")

        # Store refresh token in db
            db_refresh_token = RefreshToken(
                token=refresh_token,
                jti=jti,
                user_id=user.id,
                expires_at=datetime.utcnow() + timedelta(days=Config.REFRESH_TOKEN_EXPIRE_DAYS),
                device_info=device_info,
                ip_address=ip_address
            )

            self.session.add(db_refresh_token)

            # Update user's last login
            user.last_login = datetime.utcnow()
            user.updated_at = datetime.utcnow()
            self.session.add(user)
        
        # Commit the transaction
            await self.session.commit()

            return TokenResponse(
                access_token=access_token,
                refresh_token=refresh_token,
                token_type="Bearer",
                expires_in=Config.ACCESS_TOKEN_EXPIRE_MINUTES * 60
            )
        
        except Exception as e:
            # Rollback on any error
            await self.session.rollback()
            # Log the actual error for debugging
            print(f"Token creation error: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create authentication tokens"
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

        #get school name if exists
        school_name = None
        if user.school:
            school_name = user.school.name if user.school else None

        #create user response 
        user_response = UserResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            contact_number=user.contact_number,
            role=user.role,
            status=user.status,
            school_id=user.school_id,
            school_name=school_name,
            created_at=user.created_at,
            last_login=user.last_login,
            is_verified=user.is_verified
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
            user_id = int(user_id_str)
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
    
        # check if user already exists
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
    
        # validate password strength
        if not security.validate_password_strength(user_data.password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password does not meet strength requirements."
            )
    
        # create user object
        hashed_password = security.get_password_hash(user_data.password)
        user = User(
            email=user_data.email.lower(),
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            contact_number=user_data.contact_number,
            hashed_password=hashed_password,
            role=user_data.role,
            school_id=user_data.school_id
        )

        try:
            self.session.add(user)
            await self.session.commit()
            await self.session.refresh(user)
            school_name = None
            if user.school:
                school_name = user.school.name

            return UserResponse(
                id=user.id,
                email=user.email,
                first_name=user.first_name,
                last_name=user.last_name,
                contact_number=user.contact_number,
                role=user.role,
                status=user.status,
                school_id=user.school_id,
                school_name=school_name,
                created_at=user.created_at,
                last_login=user.last_login,
                is_verified=user.is_verified
            )

        except Exception as e:
            await self.session.rollback()
            error_trace = traceback.format_exc()
            print("❌ DB Commit Error:", str(e))
            print("🔍 Traceback:\n", error_trace)   # <-- this shows exactly what failed
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database error: {str(e)}"
        )


    async def get_user_by_id(self, user_id: int) -> Optional[UserResponse]:
        """Get user by ID"""

        user = await self.session.get(User, user_id)
        if not user or user.is_deleted:
            return None
        
        school_name = None
        if user.school:
            school_name = user.school.name

        return UserResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            contact_number=user.contact_number,
            role=user.role,
            status=user.status,
            school_id=user.school_id,
            school_name=school_name,
            created_at=user.created_at,
            last_login=user.last_login,
            is_verified=user.is_verified
        )

    async def change_password(self, user: User, current_password: str, new_password: str) -> bool:
        """Change user's password"""
        
        #verify current password
        if not security.verify_password(current_password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Current password is incorrect"
            )
        
        #validate new password strength
        if not security.validate_password_strength(new_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password does not meet strength requirements."
            )
        
        #update password
        user.hashed_password = security.get_password_hash(new_password)
        user.updated_at = datetime.utcnow()
        self.session.add(user)
        await self.session.commit()

        return True

async def get_auth_service(session: AsyncSession = Depends(get_session)) -> AuthService:
    """Dependency to get AuthService with session"""
    return AuthService(session)

    
