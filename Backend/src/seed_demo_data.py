"""
Seed demo academic data
Creates demo subjects, teachers, classes, students, assignments, exams, marks, and attendance
"""

import asyncio
from datetime import date, datetime, timedelta
from src.models.models import ExamType
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker

from src.db.main import async_engine, init_db
from src.models import (
    School, Teacher, Class, Student, Subject,
    TeacherAssignment, Marks, Attendance, Exam, ExamMarks, District
)


async def seed_demo_data():
    await init_db()

    SessionLocal = sessionmaker(
        bind=async_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async with SessionLocal() as session:
        # ✅ Ensure District & School exist
        result = await session.exec(select(School))
        school = result.first()
        if not school:
            print("⚠️ No school found. Run auth seeder first.")
            return

        # ✅ Subjects
        subjects = ["Math", "Science", "English", "History", "Computer Science"]
        existing_subjects = (await session.exec(select(Subject))).all()
        if not existing_subjects:
            for name in subjects:
                session.add(Subject(name=name))
            await session.commit()
            print("✅ Subjects seeded")

        # ✅ Teachers
        existing_teachers = (await session.exec(select(Teacher))).all()
        if not existing_teachers:
            demo_teachers = [
                Teacher(name="Neha Sharma", email="teacher1@pmshrikarnal.edu", phone="9876543210", school_id=school.id),
                Teacher(name="Amit Verma", email="teacher2@pmshrikarnal.edu", phone="9876543211", school_id=school.id),
            ]
            session.add_all(demo_teachers)
            await session.commit()
            print("✅ Teachers seeded")

        teachers = (await session.exec(select(Teacher))).all()
        subjects = (await session.exec(select(Subject))).all()

        # ✅ Classes
        existing_classes = (await session.exec(select(Class))).all()
        if not existing_classes:
            demo_classes = [
                Class(name="Class 6A", grade="6", section="A", school_id=school.id, teacher_id=teachers[0].id),
                Class(name="Class 7B", grade="7", section="B", school_id=school.id, teacher_id=teachers[1].id),
            ]
            session.add_all(demo_classes)
            await session.commit()
            print("✅ Classes seeded")

        classes = (await session.exec(select(Class))).all()

        # ✅ Students
        existing_students = (await session.exec(select(Student))).all()
        if not existing_students:
            demo_students = [
                Student(name="Riya Kapoor", roll_no="6A-01", class_id=classes[0].id),
                Student(name="Arjun Singh", roll_no="6A-02", class_id=classes[0].id),
                Student(name="Meera Joshi", roll_no="7B-01", class_id=classes[1].id),
                Student(name="Kabir Rao", roll_no="7B-02", class_id=classes[1].id),
            ]
            session.add_all(demo_students)
            await session.commit()
            print("✅ Students seeded")

        students = (await session.exec(select(Student))).all()

        # ✅ Teacher Assignments (link teacher ↔ subject ↔ class)
        existing_assignments = (await session.exec(select(TeacherAssignment))).all()
        if not existing_assignments:
            assignments = [
                TeacherAssignment(teacher_id=teachers[0].id, class_id=classes[0].id, subject_id=subjects[0].id),
                TeacherAssignment(teacher_id=teachers[1].id, class_id=classes[1].id, subject_id=subjects[1].id),
            ]
            session.add_all(assignments)
            await session.commit()
            print("✅ Teacher Assignments seeded")

        # ✅ Exams
        existing_exams = (await session.exec(select(Exam))).all()
        if not existing_exams:
            exams = [
                Exam(
                    name="Midterm Math",
                    subject_id=subjects[0].id,
                    class_id=classes[0].id,
                    teacher_id=teachers[0].id,
                    exam_type=ExamType.MIDTERM,
                    max_marks=100,
                    exam_date=date.today() - timedelta(days=15)
                ),
                Exam(
                    name="Science Quiz",
                    subject_id=subjects[1].id,
                    class_id=classes[1].id,
                    teacher_id=teachers[1].id,
                    exam_type=ExamType.QUIZ,
                    max_marks=20,
                    exam_date=date.today() - timedelta(days=7)
                ),
            ]
            session.add_all(exams)
            await session.commit()
            print("✅ Exams seeded")

        exams = (await session.exec(select(Exam))).all()

        # ✅ Exam Marks
        existing_exam_marks = (await session.exec(select(ExamMarks))).all()
        if not existing_exam_marks:
            for exam in exams:
                for student in students:
                    if student.class_id == exam.class_id:
                        session.add(ExamMarks(
                            exam_id=exam.id,
                            student_id=student.id,
                            marks_obtained=round(exam.max_marks * 0.7, 1)
                        ))
            await session.commit()
            print("✅ Exam Marks seeded")

        # ✅ Marks
        existing_marks = (await session.exec(select(Marks))).all()
        if not existing_marks:
            for student in students:
                for subj in subjects[:2]:  # give marks only for 2 subjects
                    session.add(Marks(
                        student_id=student.id,
                        subject_id=subj.id,
                        teacher_id=teachers[0].id,
                        class_id=student.class_id,
                        marks=75.0,
                        exam_type=ExamType.TERM1
                    ))
            await session.commit()
            print("✅ Marks seeded")

        # ✅ Attendance
        existing_attendance = (await session.exec(select(Attendance))).all()
        if not existing_attendance:
            for student in students:
                for i in range(5):  # last 5 days
                    session.add(Attendance(
                        student_id=student.id,
                        teacher_id=teachers[0].id,
                        class_id=student.class_id,
                        attendance_date=date.today() - timedelta(days=i),
                        is_present=True
                    ))
            await session.commit()
            print("✅ Attendance seeded")

        print("🎉 All demo academic data seeded successfully!")


if __name__ == "__main__":
    asyncio.run(seed_demo_data())
