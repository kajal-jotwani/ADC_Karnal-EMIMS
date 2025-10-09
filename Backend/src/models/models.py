from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime, date
from enum import Enum

# Import auth models
#from src.auth.models import User, UserRole, UserStatus


# ENUMS

class ExamType(str, Enum):
    TERM1 = "term1"
    TERM2 = "term2"
    TERM3 = "term3"
    FINAL = "final"
    QUIZ = "quiz"
    MIDTERM = "midterm"
    CUSTOM = "custom"


# BASE MODELS

class District(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)

    # Relationships
    schools: List["School"] = Relationship(back_populates="district")

class School(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    district_id: int = Field(foreign_key="district.id")
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

    # Relationships
    district: "District" = Relationship(back_populates="schools")
    classes: List["Class"] = Relationship(back_populates="school")
    teachers: List["Teacher"] = Relationship(back_populates="school")
    users: List["User"] = Relationship(back_populates="school")


# CLASS & TEACHER

class Class(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    grade: str
    section: str
    school_id: int = Field(foreign_key="school.id")
    teacher_id: Optional[int] = Field(default=None, foreign_key="teacher.id")

    # Relationships
    school: School = Relationship(back_populates="classes")
    teacher: Optional["Teacher"] = Relationship(back_populates="assigned_classes")
    students: List["Student"] = Relationship(back_populates="class_")
    attendance_records: List["Attendance"] = Relationship(back_populates="class_", sa_kwargs={"cascade": "all, delete-orphan"})
    exams: List["Exam"] = Relationship(back_populates="class_")
    teacher_assignments: List["TeacherAssignment"] = Relationship(back_populates="class_")

class Teacher(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    email: str = Field(unique=True)
    phone: Optional[str] = None
    school_id: int = Field(foreign_key="school.id")

    # Relationships
    school: School = Relationship(back_populates="teachers")
    assigned_classes: List[Class] = Relationship(back_populates="teacher")
    marks: List["Marks"] = Relationship(back_populates="teacher")
    assignments: List["TeacherAssignment"] = Relationship(back_populates="teacher")
    attendance_records: List["Attendance"] = Relationship(back_populates="teacher")
    exams: List["Exam"] = Relationship(back_populates="teacher")


# SUBJECT & ASSIGNMENTS

class Subject(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)

    # Relationships
    assignments: List["TeacherAssignment"] = Relationship(back_populates="subject")
    marks: List["Marks"] = Relationship(back_populates="subject")
    student_subjects: List["StudentSubject"] = Relationship(back_populates="subject")
    exams: List["Exam"] = Relationship(back_populates="subject")

class TeacherAssignment(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    teacher_id: int = Field(foreign_key="teacher.id")
    class_id: int = Field(foreign_key="class.id")
    subject_id: int = Field(foreign_key="subject.id")

    # Relationships
    teacher: Teacher = Relationship(back_populates="assignments")
    class_: Class = Relationship(back_populates="teacher_assignments")
    subject: Subject = Relationship(back_populates="assignments")


# STUDENT & SUBJECT LINK

class StudentSubject(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="student.id")
    subject_id: int = Field(foreign_key="subject.id")

    # Relationships
    student: "Student" = Relationship(back_populates="subjects")
    subject: Subject = Relationship(back_populates="student_subjects")

class Student(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    roll_no: str
    class_id: int = Field(foreign_key="class.id")
    date_enrolled: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    class_: Class = Relationship(back_populates="students")
    marks: List["Marks"] = Relationship(back_populates="student")
    attendance_records: List["Attendance"] = Relationship(back_populates="student")
    exam_marks: List["ExamMarks"] = Relationship(back_populates="student")
    subjects: List[StudentSubject] = Relationship(back_populates="student")


# MARKS & ATTENDANCE

class Marks(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="student.id")
    subject_id: int = Field(foreign_key="subject.id")
    teacher_id: int = Field(foreign_key="teacher.id")
    class_id: int = Field(foreign_key="class.id")
    marks: float
    exam_type: ExamType
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    student: Student = Relationship(back_populates="marks")
    subject: Subject = Relationship(back_populates="marks")
    teacher: Teacher = Relationship(back_populates="marks")
    class_: Class = Relationship()

class Attendance(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="student.id")
    teacher_id: int = Field(foreign_key="teacher.id")
    class_id: int = Field(foreign_key="class.id")
    attendance_date: date = Field(index=True)
    is_present: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    student: Student = Relationship(back_populates="attendance_records")
    teacher: Teacher = Relationship(back_populates="attendance_records")
    class_: Class = Relationship(back_populates="attendance_records")


# EXAMS

class Exam(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    subject_id: int = Field(foreign_key="subject.id")
    class_id: int = Field(foreign_key="class.id")
    teacher_id: int = Field(foreign_key="teacher.id")
    exam_type: ExamType = Field(default=ExamType.CUSTOM)
    max_marks: float = Field(default=100.0)
    exam_date: Optional[date] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    subject: Subject = Relationship(back_populates="exams")
    class_: Class = Relationship(back_populates="exams")
    teacher: Teacher = Relationship(back_populates="exams")
    exam_marks: List["ExamMarks"] = Relationship(back_populates="exam")

class ExamMarks(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    exam_id: int = Field(foreign_key="exam.id")
    student_id: int = Field(foreign_key="student.id")
    marks_obtained: float
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    exam: Exam = Relationship(back_populates="exam_marks")
    student: Student = Relationship(back_populates="exam_marks")
    
# Request/Response Models
class ClassCreate(SQLModel):
    name: str
    grade: str
    section: str
    school_id: int
    teacher_id: int

class ClassResponse(SQLModel):
    id: int
    name: str
    grade: str
    section: str
    school_id: int
    teacher_id: Optional[int]
    teacher_name: Optional[str] = None
    student_count: int = 0


class StudentCreate(SQLModel):
    name: str
    roll_no: str
    class_id: int

class StudentResponse(SQLModel):
    id: int
    name: str
    roll_no: str
    class_id: int
    class_name: str
    date_enrolled: datetime

class MarksCreate(SQLModel):
    student_id: int
    subject_id: int
    teacher_id: int
    class_id: int
    marks: float
    exam_type: ExamType

class AttendanceCreate(SQLModel):
    student_id: int
    teacher_id: int
    class_id: int
    date: date
    is_present: bool

class AttendanceResponse(SQLModel):
    id: int
    student_id: int
    student_name: str
    is_present: bool
    date: date

class ExamCreate(SQLModel):
    name: str
    subject_id: int
    class_id: int
    teacher_id: int
    exam_type: ExamType = ExamType.CUSTOM
    max_marks: float = 100.0
    exam_date: Optional[date] = None

class ExamMarksCreate(SQLModel):
    exam_id: int
    student_id: int
    marks_obtained: float

class ExamResponse(SQLModel):
    id: int
    name: str
    subject_name: str
    class_name: str
    max_marks: float
    exam_date: Optional[date]
    created_at: datetime

class SchoolCreate(SQLModel):
    name: str
    district_id: int
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

class SubjectCreate(SQLModel):
    name: str

class SubjectUpdate(SQLModel):
    name: Optional[str] = None