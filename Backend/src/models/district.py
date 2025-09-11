from __future__ import annotations
from sqlmodel import SQLModel, Field, Relationship, Column
from typing import List
import uuid
from sqlalchemy.dialects import postgresql as pg

from .base import BaseModel


class District(BaseModel, table=True):
    __tablename__ = "districts"

    name: str = Field(sa_column=Column(pg.VARCHAR(255), nullable=False, unique=True))

    schools: List["School"] = Relationship(back_populates="district")
    admins: List["DistrictAdmin"] = Relationship(back_populates="district")


class DistrictAdmin(BaseModel, table=True):
    __tablename__ = "district_admins"

    user_id: uuid.UUID = Field(foreign_key="users.id", unique=True, nullable=False)
    district_id: uuid.UUID = Field(foreign_key="districts.id", nullable=False)

    user: "User" = Relationship(back_populates="district_admin_profile")
    district: "District" = Relationship(back_populates="admins")
