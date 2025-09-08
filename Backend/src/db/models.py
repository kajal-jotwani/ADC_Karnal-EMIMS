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


class UserRole(str, Enum):
    District_ADMIN = "District_ADMIN"
    School_ADMIN = "School_ADMIN"
    Teacher = "Teacher"

# Core Models

class User(SQLModel, table=True):
    __tablename__ = "user"

    uid: uuid.UUID = Field(
    default_factory=uuid.uuid4,
    sa_column=Column(pg.UUID(as_uuid=True), primary_key=True),
    )
    email: str = Field(index=True, unique=True)
    password_hash: str
    role: UserRole
    linked_id: uuid.UUID | None = Field(default=None) # Links to teacher/principal/district tables
    is_active: bool = Field(default=True)
    must_change_password: bool = Field(default=False)
    created_at: datetime = Field(sa_column=Column(pg.TIMESTAMP, default=datetime.now))
    updated_at: datetime = Field(sa_column=Column(pg.TIMESTAMP, default=datetime.now))

    district: Optional["District"] = Relationship(back_populates="user")
    school: Optional["School"] = Relationship(back_populates="user")
    teacher: Optional["Teacher"] = Relationship(back_populates="user")

class District(SQLModel, table=True):
    __tablename__ = "district"

    uid: uuid.UUID = Field(
    default_factory=uuid.uuid4,
    sa_column=Column(pg.UUID(as_uuid=True), primary_key=True),
    )
    name: str

    user: Optional[User] = Relationship(back_populates="district")
    schools: List[School] = Relationship(back_populates="district")


class School(SQLModel, table=True):
    __tablename__ = "school"

    uid: uuid.UUID = Field(
    default_factory=uuid.uuid4,
    sa_column=Column(pg.UUID(as_uuid=True), primary_key=True),
    )
    name: str
    district_id: uuid.UUID = Field(foreign_key="district.uid")

    district: Optional[District] = Relationship(back_populates="schools")
    user: Optional[User] = Relationship(back_populates="school")
    classes: List[SchoolClass] = Relationship(back_populates="school")
    teachers: List[Teacher] = Relationship(back_populates="school")


class SchoolClass(SQLModel, table=True):  
    __tablename__ = "SchoolClass"

    uid: uuid.UUID = Field(
    default_factory=uuid.uuid4,
    sa_column=Column(pg.UUID(as_uuid=True), primary_key=True),
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
    default_factory=uuid.uuid4,
    sa_column=Column(pg.UUID(as_uuid=True), primary_key=True),
    )
    name: str
    school_id: uuid.UUID = Field(foreign_key="school.uid")

    school: Optional[School] = Relationship(back_populates="teachers")
    user: Optional[User] = Relationship(back_populates="teacher")
    assignments: List[TeacherAssignment] = Relationship(back_populates="teacher")
    marks: List[Marks] = Relationship(back_populates="teacher")


class Student(SQLModel, table=True):
    __tablename__ = "student"

    uid: uuid.UUID = Field(
    default_factory=uuid.uuid4,
    sa_column=Column(pg.UUID(as_uuid=True), primary_key=True),
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
    default_factory=uuid.uuid4,
    sa_column=Column(pg.UUID(as_uuid=True), primary_key=True),
    )
    name: str

    teacher_assignments: List[TeacherAssignment] = Relationship(back_populates="subject")
    student_subjects: List[StudentSubject] = Relationship(back_populates="subject")

# Relational Models

class TeacherAssignment(SQLModel, table=True):
    __tablename__ = "teacher_assignment"

    uid: uuid.UUID = Field(
    default_factory=uuid.uuid4,
    sa_column=Column(pg.UUID(as_uuid=True), primary_key=True),
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
    default_factory=uuid.uuid4,
    sa_column=Column(pg.UUID(as_uuid=True), primary_key=True),
    )
    student_id: uuid.UUID = Field(foreign_key="student.uid")
    subject_id: uuid.UUID = Field(foreign_key="subject.uid")

    student: Optional[Student] = Relationship(back_populates="subjects")
    subject: Optional[Subject] = Relationship(back_populates="student_subjects")


class Marks(SQLModel, table=True):
    __tablename__ = "marks"

    uid: uuid.UUID = Field(
    default_factory=uuid.uuid4,
    sa_column=Column(pg.UUID(as_uuid=True), primary_key=True),
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
    default_factory=uuid.uuid4,
    sa_column=Column(pg.UUID(as_uuid=True), primary_key=True),
    )
    student_id: uuid.UUID = Field(foreign_key="student.uid")
    class_id: uuid.UUID = Field(foreign_key="SchoolClass.uid")
    date: date
    status: AttendanceStatus = Field(default=AttendanceStatus.present)

    student: Optional[Student] = Relationship(back_populates="attendance_records")
    class_: Optional[SchoolClass] = Relationship(back_populates="attendance_records")

