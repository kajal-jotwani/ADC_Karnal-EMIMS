from __future__ import annotations
from datetime import datetime
import uuid
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship, Column
import sqlalchemy.dialects.postgresql as pg

from .base import BaseModel, Role


class User(BaseModel, table=True):
    __tablename__ = "users"

    email: str = Field(sa_column=Column(pg.VARCHAR(255), unique=True, index=True, nullable=False))
    first_name: str
    last_name: str
    contact_number: str = Field(sa_column=Column(pg.VARCHAR(15), unique=True, index=True, nullable=False))
    is_verified: bool = Field(default=False)
    is_active: bool = Field(default=True)
    hashed_password: str = Field(sa_column=Column(pg.VARCHAR, nullable=False), exclude=True)
    role: Role = Field(sa_column=Column(pg.VARCHAR, nullable=False))

    # Auth-related fields
    last_login: Optional[datetime] = None
    reset_token: Optional[str] = None
    reset_token_expires: Optional[datetime] = None
    verification_token: Optional[str] = None

    # Role profiles
    district_admin_profile: Optional["DistrictAdmin"] = Relationship(back_populates="user")
    principal_profile: Optional["Principal"] = Relationship(back_populates="user")
    teacher_profile: Optional["Teacher"] = Relationship(back_populates="user")

    # Auth relationship
    refresh_tokens: List["RefreshToken"] = Relationship(back_populates="user")
