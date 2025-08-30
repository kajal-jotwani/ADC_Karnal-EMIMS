from __future__ import annotations

from typing import Optional, List
from datetime import date, datetime
from enum import Enum
import uuid

from sqlmodel import SQLModel, Field, Relationship, Column
import sqlalchemy.dialects.postgresql as pg


# Enums

class AttendanceStatus(str, Enum):
    present = "Present"
    absent = "Absent"


# Core Models

class District(SQLModel, table=True):
    __tablename__ = "district"

    uid: uuid.UUID = Field(
        sa_column=Column(pg.UUID(as_uuid=True), primary_key=True, default_factory=uuid.uuid4)
    )
    name: str

    schools: List[School] = Relationship(back_populates="district")


class School(SQLModel, table=True):
    __tablename__ = "school"

    uid: uuid.UUID = Field(
        sa_column=Column(pg.UUID(as_uuid=True), primary_key=True, default_factory=uuid.uuid4)
    )
    name: str
    district_id: uuid.UUID = Field(foreign_key="district.uid")

    district: Optional[District] = Relationship(back_populates="schools")
    classes: List[SchoolClass] = Relationship(back_populates="school")
    teachers: List[Teacher] = Relationship(back_populates="school")


class SchoolClass(SQLModel, table=True):  
    __tablename__ = "SchoolClass"

    uid: uuid.UUID = Field(
        sa_column=Column(pg.UUID(as_uuid=True), primary_key=True, default_factory=uuid.uuid4)
    )
    name: str
    school_id: uuid.UUID = Field(foreign_key="school.uid")

    school: Optional[School] = Relationship(back_populates="classes")
    students: List[Student] = Relationship(back_populates="class_")
    teacher_assignments: List[TeacherAssignment] = Relationship(back_populates="class_")
    attendance_records: List[Attendance] = Relationship(back_populates="class_")


class Teacher(SQLModel, table=True):
    __tablename__ = "teacher"

    uid: uuid.UUID = Field(
        sa_column=Column(pg.UUID(as_uuid=True), primary_key=True, default_factory=uuid.uuid4)
    )
    name: str
    school_id: uuid.UUID = Field(foreign_key="school.uid")

    school: Optional[School] = Relationship(back_populates="teachers")
    assignments: List[TeacherAssignment] = Relationship(back_populates="teacher")
    marks: List[Marks] = Relationship(back_populates="teacher")


class Student(SQLModel, table=True):
    __tablename__ = "student"

    uid: uuid.UUID = Field(
        sa_column=Column(pg.UUID(as_uuid=True), primary_key=True, default_factory=uuid.uuid4)
    )
    name: str
    roll_number: str
    class_id: uuid.UUID = Field(foreign_key="SchoolClass.uid")

    class_: Optional[SchoolClass] = Relationship(back_populates="students")
    marks: List[Marks] = Relationship(back_populates="student")
    attendance_records: List[Attendance] = Relationship(back_populates="student")
    subjects: List[StudentSubject] = Relationship(back_populates="student")


class Subject(SQLModel, table=True):
    __tablename__ = "subject"

    uid: uuid.UUID = Field(
        sa_column=Column(pg.UUID(as_uuid=True), primary_key=True, default_factory=uuid.uuid4)
    )
    name: str

    teacher_assignments: List[TeacherAssignment] = Relationship(back_populates="subject")
    student_subjects: List[StudentSubject] = Relationship(back_populates="subject")

# Relational Models

class TeacherAssignment(SQLModel, table=True):
    __tablename__ = "teacher_assignment"

    uid: uuid.UUID = Field(
        sa_column=Column(pg.UUID(as_uuid=True), primary_key=True, default_factory=uuid.uuid4)
    )
    teacher_id: uuid.UUID = Field(foreign_key="teacher.uid")
    class_id: uuid.UUID = Field(foreign_key="SchoolClass.uid")
    subject_id: uuid.UUID = Field(foreign_key="subject.uid")

    teacher: Optional[Teacher] = Relationship(back_populates="assignments")
    class_: Optional[SchoolClass] = Relationship(back_populates="teacher_assignments")
    subject: Optional[Subject] = Relationship(back_populates="teacher_assignments")


class StudentSubject(SQLModel, table=True):
    __tablename__ = "student_subject"

    uid: uuid.UUID = Field(
        sa_column=Column(pg.UUID(as_uuid=True), primary_key=True, default_factory=uuid.uuid4)
    )
    student_id: uuid.UUID = Field(foreign_key="student.uid")
    subject_id: uuid.UUID = Field(foreign_key="subject.uid")

    student: Optional[Student] = Relationship(back_populates="subjects")
    subject: Optional[Subject] = Relationship(back_populates="student_subjects")


class Marks(SQLModel, table=True):
    __tablename__ = "marks"

    uid: uuid.UUID = Field(
        sa_column=Column(pg.UUID(as_uuid=True), primary_key=True, default_factory=uuid.uuid4)
    )
    student_id: uuid.UUID = Field(foreign_key="student.uid")
    subject_id: uuid.UUID = Field(foreign_key="subject.uid")
    teacher_id: uuid.UUID = Field(foreign_key="teacher.uid")
    marks: float
    exam_type: str  

    student: Optional[Student] = Relationship(back_populates="marks")
    teacher: Optional[Teacher] = Relationship(back_populates="marks")


class Attendance(SQLModel, table=True):
    __tablename__ = "attendance"

    uid: uuid.UUID = Field(
        sa_column=Column(pg.UUID(as_uuid=True), primary_key=True, default_factory=uuid.uuid4)
    )
    student_id: uuid.UUID = Field(foreign_key="student.uid")
    class_id: uuid.UUID = Field(foreign_key="SchoolClass.uid")
    date: date
    status: AttendanceStatus = Field(default=AttendanceStatus.present)

    student: Optional[Student] = Relationship(back_populates="attendance_records")
    class_: Optional[SchoolClass] = Relationship(back_populates="attendance_records")

