from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from src.db.main import get_session
from .dependencies import get_current_active_user, security_scheme
from src.models import User
from .services import AuthService, get_auth_service

from .models import(
    UserLogin, UserCreate, UserResponse, LoginResponse,TokenResponse,
    ChangePasswordRequest, RefreshTokenRequest
)

auth_router = APIRouter()

#register user 
@auth_router.post("/register", status_code=status.HTTP_201_CREATED, response_model=UserResponse)
async def register_user(
    user_data: UserCreate,
    auth_service: AuthService = Depends(get_auth_service)
):
    try:
        user = await auth_service.create_user(user_data)
        return user

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User registration failed"
        )

@auth_router.post("/login", response_model=LoginResponse)
async def login(
    login_data: UserLogin,
    request: Request,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Login endpoint
    Authenticates user and returns user data with access and refresh tokens
    """
    # Get client info for token tracking
    device_info = request.headers.get("User-Agent", "Unknown")
    ip_address = request.client.host if request.client else "Unknown"
    
    try:
        result = await auth_service.login(login_data, device_info, ip_address)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )
    
@auth_router.post("/logout")
async def logout(
    refresh_data: RefreshTokenRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Logout endpoint
    Revokes the provided refresh token
    """
    success = await auth_service.logout(refresh_data.refresh_token)
    return {"message": "Logged out successfully", "success": success}

@auth_router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)  # Changed from UserResponse to User
):
    """
    Get current user information
    """
    # Convert User model to UserResponse
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        contact_number=current_user.contact_number,
        role=current_user.role,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at,
        last_login=current_user.last_login
    )

@auth_router.post("/change-password")
async def change_password(
    password_data: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user),  # Changed from UserResponse to User
    auth_service: AuthService = Depends(get_auth_service)
):
    """
    Change user password
    """
    success = await auth_service.change_password(
        current_user,  # Pass the User object directly
        password_data.current_password, 
        password_data.new_password
    )
    
    if success:
        return {"message": "Password changed successfully"}
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to change password"
        )

@auth_router.get("/verify-token")
async def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    current_user: User = Depends(get_current_active_user)  # Changed from UserResponse to User
):
    """
    Verify if the current token is valid
    """
    # Convert User model to UserResponse for the response
    user_response = UserResponse(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        contact_number=current_user.contact_number,
        role=current_user.role,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        created_at=current_user.created_at,
        last_login=current_user.last_login
    )
    
    return {
        "valid": True,
        "user": user_response,
        "message": "Token is valid"
    }

