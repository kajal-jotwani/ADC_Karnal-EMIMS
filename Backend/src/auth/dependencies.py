"""
Authentication dependencies.
Provides dependency injections for auth
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from typing import Optional
import uuid

from .models import User, UserRole, RefreshToken
from src.db.main import get_session
from .security import security


#security scheme for JWT tokens
security_scheme = HTTPBearer()

async def get_current_user(
        credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
        session: AsyncSession = Depends(get_session)
    ) -> User:
    """Dependency to get the current authenticated user from JWT token"""

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},     
    )

    try:

        #verify the access token
        payload = security.verify_token(credentials.credentials, token_type="access")
        user_id_str: str = payload.get("sub")
        jti: str = payload.get("jti")

        if user_id_str is None or jti is None:
            raise credentials_exception
        
        user_id = int(user_id_str)

    except(HTTPException, ValueError):
        raise credentials_exception
    
    # Fetch the user with eager loading of school relationship
    result = await session.exec(
        select(User)
        .where(User.id == user_id)
        .options(selectinload(User.school))
    )
    user = result.first()
    
    if user is None:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )
    
    return user

async def get_current_active_user(
        current_user: User = Depends(get_current_user)
    ) -> User:

    """Dependency to get current active user"""

    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user",
        )
    return current_user

def require_roles(*allowed_roles: UserRole):

    """
    Dependency to enforce role-based access control
    Usage: @app.get("/admin", dependencies=[Depends(require_roles(Role.DISTRICT_ADMIN))])
    """
    async def role_checker(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation requires one of these roles: {', '.join([role.value for role in allowed_roles])}"
            )
        return current_user
    
    return role_checker

#specific role dependencies
require_admin = require_roles(UserRole.ADMIN)
require_principal = require_roles(UserRole.PRINCIPAL)
require_teacher = require_roles(UserRole.TEACHER)
require_admin_or_principal = require_roles(UserRole.ADMIN, UserRole.PRINCIPAL)

async def verify_refresh_token(
        refresh_token: str,
        session: AsyncSession = Depends(get_session)
    ) -> User:

    """verify the refresh token and return the associated user"""
    try:
        #verify token signature and expiry
        payload = security.verify_token(refresh_token, "refresh")
        user_id_str: str = payload.get("sub")
        jti: str = payload.get("jti")

        if user_id_str is None or jti is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",    
            )
        
        user_id = int(user_id_str)

        #check if refresh token exists in DB and is not revoked
        result = await session.exec(
            select(RefreshToken)
            .where(RefreshToken.token == refresh_token)
            .where(RefreshToken.jti == jti)
            .where(RefreshToken.is_revoked == False)
        )
        db_token = result.first()

        if not db_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",    
            )
        
        #get associated user with eager loading
        user_result = await session.exec(
            select(User)
            .where(User.id == user_id)
            .options(selectinload(User.school))
        )
        user = user_result.first()
        
        if user is None or not user.is_active or user.is_deleted:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",    
            )
        return user
    
    except HTTPException:
        raise
    except (ValueError, Exception):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",    
        )