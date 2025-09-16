from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid
from pydantic import EmailStr

class UserRole(str, Enum):
    ADMIN = "admin"
    PRINCIPAL = "principal"
    TEACHER = "teacher"

class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    hashed_password: str = Field(max_length=255)
    first_name: str
    last_name: str
    contact_number: Optional[str] = None
    role: UserRole = Field(default=UserRole.TEACHER)
    status: UserStatus = Field(default=UserStatus.ACTIVE)
    is_deleted: bool = Field(default=False)
    school_id: Optional[int] = Field(default=None, foreign_key="school.id")

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None

    reset_token: Optional[str] = None
    reset_token_expires: Optional[datetime] = None
    is_verified: bool = Field(default=True)
    verification_token: Optional[str] = None

    # Relationships
    school: Optional["School"] = Relationship(back_populates="users")
    refresh_tokens: List["RefreshToken"] = Relationship(back_populates="user")

    @property
    def is_active(self):
        return self.status == UserStatus.ACTIVE and not self.is_deleted

class RefreshToken(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    token: str = Field(unique=True, index=True)
    jti: str = Field(unique=True, index=True)
    user_id: int = Field(foreign_key="user.id")
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_revoked: bool = Field(default=False)

    device_info: Optional[str] = None
    ip_address: Optional[str] = None

    # Relationships
    user: User = Relationship(back_populates="refresh_tokens")

# Request / Response DTOs

class UserLogin(SQLModel):
    email: EmailStr
    password: str

class UserCreate(SQLModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    contact_number: Optional[str] = None
    role: UserRole = UserRole.TEACHER
    school_id: Optional[int] = None

class UserUpdate(SQLModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    contact_number: Optional[str] = None
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
    school_id: Optional[int] = None

class UserResponse(SQLModel):
    id: int
    email: str
    first_name: str
    last_name: str
    contact_number: Optional[str] = None
    role: UserRole
    status: UserStatus
    school_id: Optional[int] = None
    school_name: Optional[str] = None
    created_at: datetime
    last_login: Optional[datetime]
    is_verified: bool

class TokenResponse(SQLModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class LoginResponse(SQLModel):
    user: UserResponse
    tokens: TokenResponse

class RefreshTokenRequest(SQLModel):
    refresh_token: str

class PasswordResetRequest(SQLModel):
    email: str

class PasswordResetConfirm(SQLModel):
    token: str
    new_password: str

class ChangePasswordRequest(SQLModel):
    current_password: str
    new_password: str