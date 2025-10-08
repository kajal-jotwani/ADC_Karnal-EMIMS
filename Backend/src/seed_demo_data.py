"""
Seed demo academic data
Creates demo subjects, teachers, classes, students, assignments, exams, marks, and attendance
"""

import asyncio
from datetime import date, timedelta
import random
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker

from src.db.main import async_engine, init_db
from src.models.models import ExamType
from src.models import (
    District, School, Teacher, Class, Student, Subject,
    TeacherAssignment, Exam, ExamMarks, Marks, Attendance
)


async def seed_demo_data():
    await init_db()

    SessionLocal = sessionmaker(
        bind=async_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async with SessionLocal() as session:
        # ✅ District
        district_name = "Karnal District"
        district = (await session.exec(select(District).where(District.name == district_name))).first()
        if not district:
            district = District(name=district_name)
            session.add(district)
            await session.commit()
            print("✅ District: Karnal District seeded")

        # ✅ Schools
        school_data = [
            {
                "name": "PM Shri Government Sr. Secondary School, Karnal",
                "address": "Sector 12, Karnal, Haryana",
                "phone": "0184-2223344",
                "email": "info@pmshrikarnal.edu"
            },
            {
                "name": "Delhi Public School, Karnal",
                "address": "Near Kunjpura Road, Karnal",
                "phone": "0184-2256677",
                "email": "contact@dpskarnal.edu"
            },
            {
                "name": "Tagore International School, Karnal",
                "address": "Sector 6, Urban Estate, Karnal",
                "phone": "0184-2277889",
                "email": "admin@tagorekarnal.edu"
            }
        ]

        existing_schools = (await session.exec(select(School))).all()
        if not existing_schools:
            for s in school_data:
                session.add(School(district_id=district.id, **s))
            await session.commit()
            print("✅ Schools seeded")

        schools = (await session.exec(select(School))).all()

        # ✅ Subjects
        subject_names = [
            "Mathematics", "Science", "English", "Hindi",
            "Social Science", "Computer Science", "Sanskrit", "Art", "Physical Education"
        ]
        if not (await session.exec(select(Subject))).first():
            for name in subject_names:
                session.add(Subject(name=name))
            await session.commit()
            print("✅ Subjects seeded")

        subjects = (await session.exec(select(Subject))).all()

        # ✅ Teachers
        teacher_names = [
            "Neha Sharma", "Amit Verma", "Priya Nair", "Suresh Kumar", "Divya Rani",
            "Anil Mehta", "Kavita Singh", "Rohit Bansal", "Nisha Chauhan", "Puneet Arora",
            "Vikram Saini", "Richa Malhotra", "Arun Yadav", "Meenakshi Thakur", "Deepak Garg"
        ]
        if not (await session.exec(select(Teacher))).first():
            teachers = []
            for i, name in enumerate(teacher_names):
                teachers.append(
                    Teacher(
                        name=name,
                        email=f"{name.lower().replace(' ', '.')}@pmshrikarnal.edu",
                        phone=f"98{random.randint(10000000,99999999)}",
                        school_id=random.choice(schools).id
                    )
                )
            session.add_all(teachers)
            await session.commit()
            print("✅ Teachers seeded")

        teachers = (await session.exec(select(Teacher))).all()

        # ✅ Classes
        class_data = []
        for school in schools:
            for grade in range(6, 11):
                for section in ["A", "B"]:
                    class_data.append(
                        Class(
                            name=f"Class {grade}{section}",
                            grade=str(grade),
                            section=section,
                            school_id=school.id,
                            teacher_id=random.choice(teachers).id
                        )
                    )
        if not (await session.exec(select(Class))).first():
            session.add_all(class_data)
            await session.commit()
            print("✅ Classes seeded")

        classes = (await session.exec(select(Class))).all()

        # ✅ Students
        student_names = [
            "Riya Kapoor", "Arjun Singh", "Meera Joshi", "Kabir Rao", "Aanya Mehta",
            "Rohan Patel", "Simran Kaur", "Vivek Sharma", "Kunal Joshi", "Tanya Bansal",
            "Devanshi Yadav", "Harshita Jain", "Rahul Khanna", "Isha Chauhan", "Tanvi Gupta",
            "Aryan Raj", "Manav Gill", "Neelam Reddy", "Sakshi Kapoor", "Krish Mehta",
            "Zoya Ali", "Parth Arora", "Ritvik Sharma", "Rachit Sinha", "Mitali Verma",
            "Ananya Tiwari", "Varun Malhotra", "Pihu Jain", "Ishaan Grover", "Vanshika Dutt",
            "Shreya Bansal", "Aarav Nair", "Dhruv Sehgal", "Yashika Garg", "Ira Sharma",
            "Mohit Kumar", "Aditi Singh", "Ravina Sethi", "Reyansh Arora", "Ridhi Malhotra",
            "Sanya Verma", "Laksh Gupta", "Nakul Saini", "Kritika Mehta", "Rajveer Chauhan",
            "Avantika Rao", "Manan Bansal", "Shrishti Patel", "Rekha Yadav", "Kushagra Sharma"
        ]
        if not (await session.exec(select(Student))).first():
            roll_counter = 1
            for cls in classes:
                for i in range(8):  # ~8 students per class
                    name = random.choice(student_names)
                    session.add(
                        Student(
                            name=name,
                            roll_no=f"{cls.grade}{cls.section}-{roll_counter:02}",
                            class_id=cls.id
                        )
                    )
                    roll_counter += 1
            await session.commit()
            print("✅ Students seeded")

        students = (await session.exec(select(Student))).all()

        # ✅ Teacher Assignments
        if not (await session.exec(select(TeacherAssignment))).first():
            for cls in classes:
                for subj in random.sample(subjects, 4):  # 4 subjects per class
                    session.add(
                        TeacherAssignment(
                            teacher_id=random.choice(teachers).id,
                            class_id=cls.id,
                            subject_id=subj.id
                        )
                    )
            await session.commit()
            print("✅ Teacher Assignments seeded")

        # ✅ Exams
        if not (await session.exec(select(Exam))).first():
            for cls in classes:
                for subj in random.sample(subjects, 3):
                    session.add(
                        Exam(
                            name=f"{subj.name} Midterm",
                            subject_id=subj.id,
                            class_id=cls.id,
                            teacher_id=random.choice(teachers).id,
                            exam_type=random.choice(list(ExamType)),
                            max_marks=100,
                            exam_date=date.today() - timedelta(days=random.randint(5, 20))
                        )
                    )
            await session.commit()
            print("✅ Exams seeded")

        exams = (await session.exec(select(Exam))).all()

        # ✅ Exam Marks
        if not (await session.exec(select(ExamMarks))).first():
            for exam in exams:
                class_students = [s for s in students if s.class_id == exam.class_id]
                for student in class_students:
                    marks_obtained = round(random.uniform(45, 95), 1)
                    session.add(ExamMarks(
                        exam_id=exam.id,
                        student_id=student.id,
                        marks_obtained=marks_obtained
                    ))
            await session.commit()
            print("✅ Exam Marks seeded")

        # ✅ Attendance (10 days)
        if not (await session.exec(select(Attendance))).first():
            for student in students:
                for i in range(10):
                    session.add(
                        Attendance(
                            student_id=student.id,
                            teacher_id=random.choice(teachers).id,
                            class_id=student.class_id,
                            attendance_date=date.today() - timedelta(days=i),
                            is_present=random.random() > 0.1  # 90% attendance rate
                        )
                    )
            await session.commit()
            print("✅ Attendance seeded")

        print("\n🎓 Dense demo data seeded successfully for Karnal District!")
        print("📚 Schools, Classes, Teachers, Students, Marks, Attendance & Exams included.")


if __name__ == "__main__":
    asyncio.run(seed_demo_data())
