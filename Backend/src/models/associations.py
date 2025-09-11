from sqlmodel import SQLModel, Field
import uuid


class ClassTeacherLink(SQLModel, table=True):
    __tablename__ = "class_teacher_link"

    class_id: uuid.UUID = Field(foreign_key="classes.id", primary_key=True)
    teacher_id: uuid.UUID = Field(foreign_key="teachers.id", primary_key=True)


class ClassSubjectLink(SQLModel, table=True):
    __tablename__ = "class_subject_link"

    class_id: uuid.UUID = Field(foreign_key="classes.id", primary_key=True)
    subject_id: uuid.UUID = Field(foreign_key="subjects.id", primary_key=True)


class TeacherSubjectLink(SQLModel, table=True):
    __tablename__ = "teacher_subject_link"

    teacher_id: uuid.UUID = Field(foreign_key="teachers.id", primary_key=True)
    subject_id: uuid.UUID = Field(foreign_key="subjects.id", primary_key=True)
