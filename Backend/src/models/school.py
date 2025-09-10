from __future__ import annotations
from sqlmodel import SQLModel, Field, Relationship, Column
from typing import List
import uuid
from sqlalchemy.dialects import postgresql as pg

from .base import BaseModel


class School(BaseModel, table=True):
    __tablename__ = "schools"

    school_name: str = Field(nullable=False, unique=True)
    school_code: str = Field(nullable=False, unique=True)
    block_name: str = Field(nullable=False)
    district_id: uuid.UUID = Field(foreign_key="districts.id")

    district: "District" = Relationship(back_populates="schools")
    principals: List["Principal"] = Relationship(back_populates="school")
    teachers: List["Teacher"] = Relationship(back_populates="school")
    classes: List["Class"] = Relationship(back_populates="school")


class Principal(BaseModel, table=True):
    __tablename__ = "principals"

    user_id: uuid.UUID = Field(foreign_key="users.id", unique=True, nullable=False)
    school_id: uuid.UUID = Field(foreign_key="schools.id", nullable=False)

    user: User = Relationship(back_populates="principal_profile")
    school: School = Relationship(back_populates="principals")
    teachers: List["Teacher"] = Relationship(back_populates="principal")


class Teacher(BaseModel, table=True):
    __tablename__ = "teachers"

    user_id: uuid.UUID = Field(foreign_key="users.id", unique=True, nullable=False)
    experience: int = Field(default=0, nullable=True)
    school_id: uuid.UUID = Field(foreign_key="schools.id", nullable=False)
    principal_id: uuid.UUID = Field(foreign_key="principals.id", nullable=True)

    user: User = Relationship(back_populates="teacher_profile")
    school: School = Relationship(back_populates="teachers")
    classes: List["ClassTeacherLink"] = Relationship(back_populates="teacher")
    subjects: List["TeacherSubjectLink"] = Relationship(back_populates="teacher")
