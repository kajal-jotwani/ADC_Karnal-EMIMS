from __future__ import annotations
from sqlmodel import SQLModel, Field, Relationship, Column
import uuid
from typing import Optional
from datetime import datetime
from pydantic import EmailStr
import sqlalchemy.dialects.postgresql as pg 

from src.models.base import BaseModel, Role

class RefreshToken(BaseModel, table=True):
    '''Refresh token model for JWT token management'''
    __tablename__ = "refresh_tokens"

    token: str = Field(sa_column=Column(pg.VARCHAR, unique=True, index=True, nullable=False))
    user_id: uuid.UUID = Field(foreign_key="users.id", nullable=False)
    expires_at: datetime = Field(nullable=False)
    is_revoked: bool = Field(default=False)

    #jti for token identification
    jti: str = Field(nullable=False, index=True)

    # Device/session tracking
    device_info: Optional[str] = None
    ip_address: Optional[str] = None

    user: "User" = Relationship(back_populates="refresh_tokens")


# Request/Response Models
class UserLogin(SQLModel):
    """Login request model"""
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)

class UserCreate(SQLModel):
    """User creation model"""
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    first_name: str
    last_name: str
    contact_number: str = Field(min_length=10, max_length=10)
    role: Role = Field(default=Role.TEACHER)

class UserUpdate(SQLModel):
    """User update model"""
    first_name: Optional[str] = Field(None, max_length=50)
    last_name: Optional[str] = Field(None, max_length=50)
    contact_number: Optional[str] = Field(None, max_length=15)
    role: Optional[Role] = None
    is_active: Optional[bool] = None 

class UserResponse(SQLModel):
    """User response model """
    id: uuid.UUID
    email: str
    first_name: str
    last_name: str
    contact_number: str
    role: Role
    is_active: bool
    is_verified: bool
    created_at: datetime
    last_login: Optional[datetime]

class TokenResponse(SQLModel):
    """Token response model"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int 

class LoginResponse(SQLModel):
    """Login response model"""
    user: UserResponse
    tokens: TokenResponse


class RefreshTokenRequest(SQLModel):
    """Refresh token request model"""
    refresh_token: str


class PasswordResetRequest(SQLModel):
    """Password reset request model"""
    email: str


class PasswordResetConfirm(SQLModel):
    """Password reset confirmation model"""
    token: str
    new_password: str = Field(min_length=8)


class ChangePasswordRequest(SQLModel):
    """Change password request model"""
    current_password: str
    new_password: str = Field(min_length=8)