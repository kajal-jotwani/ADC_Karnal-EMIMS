from __future__ import annotations
from sqlmodel import SQLModel, Field, Relationship
import uuid
from datetime import date, datetime
from typing import List

from .base import BaseModel, AttendanceStatus


class Attendance(BaseModel, table=True):
    __tablename__ = "attendance"

    student_id: uuid.UUID = Field(foreign_key="students.id", nullable=False)
    class_id: uuid.UUID = Field(foreign_key="classes.id", nullable=False)
    teacher_id: uuid.UUID = Field(foreign_key="teachers.id", nullable=False)
    attendance_date: date = Field(default_factory=date.today)
    status: AttendanceStatus

    student: "Student" = Relationship(back_populates="attendance")
    teacher: "Teacher" = Relationship()
    class_: "Class" = Relationship()


class Exam(BaseModel, table=True):
    __tablename__ = "exams"

    name: str
    subject_id: uuid.UUID = Field(foreign_key="subjects.id", nullable=False)
    class_id: uuid.UUID = Field(foreign_key="classes.id", nullable=False)
    teacher_id: uuid.UUID = Field(foreign_key="teachers.id", nullable=False)
    max_marks: float = Field(default=100.0)
    exam_date: date

    subject: "Subject" = Relationship()
    class_: "Class" = Relationship()
    teacher: "Teacher" = Relationship()
    exam_marks: List["ExamMarks"] = Relationship(back_populates="exam")


class ExamMarks(BaseModel, table=True):
    __tablename__ = "exam_marks"

    exam_id: uuid.UUID = Field(foreign_key="exams.id", nullable=False)
    student_id: uuid.UUID = Field(foreign_key="students.id", nullable=False)
    marks_obtained: float
    created_at: datetime = Field(default_factory=datetime.utcnow)

    exam: Exam = Relationship(back_populates="exam_marks")
    student: "Student" = Relationship()
