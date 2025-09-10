from __future__ import annotations
from .base import BaseModel, Role, AttendanceStatus
from .user import User
from .district import District, DistrictAdmin
from .school import School, Principal, Teacher
from .classroom import Class, Student, Subject
from .records import Attendance, Exam, ExamMarks

__all__ = [
    "BaseModel",
    "Role",
    "AttendanceStatus",
    "User",
    "District",
    "DistrictAdmin",
    "School",
    "Principal",
    "Teacher",
    "Class",
    "Student",
    "Subject",
    "Attendance",
    "Exam",
    "ExamMarks",
]
