from __future__ import annotations
from sqlmodel import SQLModel, Field, Relationship
import uuid
from typing import List

from .base import BaseModel


class Class(BaseModel, table=True):
    __tablename__ = "classes"

    class_name: str = Field(nullable=False)
    section: str = Field(nullable=False)
    school_id: uuid.UUID = Field(foreign_key="schools.id", nullable=False)

    school: "School" = Relationship(back_populates="classes")
    students: List["Student"] = Relationship(back_populates="class_")
    class_teachers: List["ClassTeacherLink"] = Relationship(back_populates="class_")


class Student(BaseModel, table=True):
    __tablename__ = "students"

    roll_number: str
    name: str
    class_id: uuid.UUID = Field(foreign_key="classes.id")

    class_: Class = Relationship(back_populates="students")
    marks: List["ExamMarks"] = Relationship(back_populates="student")
    attendance: List["Attendance"] = Relationship(back_populates="student")


class Subject(BaseModel, table=True):
    __tablename__ = "subjects"

    name: str
    code: str
