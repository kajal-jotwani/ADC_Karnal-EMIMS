"""
Dahsboard API endpoints
Provides aggregated data for dashboard views
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, cast, Integer
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict, Any, List
from datetime import datetime, timedelta
from src.db.main import get_session
from src.auth.dependencies import get_current_active_user
from src.auth.models import User, UserRole
from src.models import School, Teacher, Student, Class, Attendance, Marks, Subject

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session)
) -> Dict[str, Any]:
    """
    This endpoint gives dashboard stats based on user role
    """
    stats = {}

    if current_user.role == UserRole.ADMIN:
        total_schools_res = await session.exec(select(func.count(School.id)))
        total_students_res = await session.exec(select(func.count(Student.id)))
        total_teachers_res = await session.exec(select(func.count(Teacher.id)))
        total_subjects_res = await session.exec(select(func.count(Subject.id)))

        stats = {
            "total_schools": total_schools_res.one(),
            "total_students": total_students_res.one(),
            "total_teachers": total_teachers_res.one(),
            "total_subjects": total_subjects_res.one(),
        }

        avg_attendance_res = await session.exec(
            select(func.avg(cast(Attendance.is_present, Integer)) * 100)
            .where(Attendance.attendance_date >= datetime.now().date() - timedelta(days=30))
        )
        stats["average_attendance"] = round(avg_attendance_res.one() or 0, 1)

    elif current_user.role == UserRole.PRINCIPAL:
        if current_user.school_id:
            total_students_res = await session.exec(
                select(func.count(Student.id))
                .join(Class, Student.class_id == Class.id)
                .where(Class.school_id == current_user.school_id)
            )
            total_teachers_res = await session.exec(
                select(func.count(Teacher.id))
                .where(Teacher.school_id == current_user.school_id)
            )
            total_classes_res = await session.exec(
                select(func.count(Class.id))
                .where(Class.school_id == current_user.school_id)
            )

            stats = {
                "total_students": total_students_res.one(),
                "total_teachers": total_teachers_res.one(),
                "total_classes": total_classes_res.one(),
            }

            avg_attendance_res = await session.exec(
                select(func.avg(cast(Attendance.is_present, Integer) * 100))
                .join(Class, Attendance.class_id == Class.id)
                .where(Class.school_id == current_user.school_id)
                .where(Attendance.attendance_date >= datetime.now().date() - timedelta(days=30))
            )
            stats["average_attendance"] = round(avg_attendance_res.one() or 0, 1)

    elif current_user.role == UserRole.TEACHER:
        teacher_res = await session.exec(
            select(Teacher).where(Teacher.email == current_user.email)
        )
        teacher = teacher_res.first()

        if teacher:
            from src.models import TeacherAssignment
            class_ids_res = await session.exec(
                select(TeacherAssignment.class_id)
                .where(TeacherAssignment.teacher_id == teacher.id)
            )
            class_ids = [c[0] for c in class_ids_res.all()]  # unpack tuple results

            total_students_res = await session.exec(
                select(func.count(Student.id))
                .where(Student.class_id.in_(class_ids))
            )
            subjects_taught_res = await session.exec(
                select(func.count(func.distinct(TeacherAssignment.subject_id)))
                .where(TeacherAssignment.teacher_id == teacher.id)
            )

            stats = {
                "total_students": total_students_res.one(),
                "total_classes": len(class_ids),
                "subjects_taught": subjects_taught_res.one(),
            }

    return stats

#currently hardcoaded will improve and replace later
@router.get("/recent-activity")
async def get_recent_activity(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session)
) -> List[Dict[str, Any]]:
    activities = []

    if current_user.role == UserRole.ADMIN:
        activities = [
            {"id": "1", "type": "success", "message": "New school 'Jefferson Academy' added to the system", "timestamp": (datetime.now() - timedelta(hours=2)).isoformat(), "icon": "school"},
            {"id": "2", "type": "info", "message": "Monthly performance reports generated", "timestamp": (datetime.now() - timedelta(hours=5)).isoformat(), "icon": "report"},
            {"id": "3", "type": "warning", "message": "Data sync from 3 schools pending", "timestamp": (datetime.now() - timedelta(days=1)).isoformat(), "icon": "sync"}
        ]
    elif current_user.role == UserRole.PRINCIPAL:
        activities = [
            {"id": "1", "type": "success", "message": "Class 10A achieved 95% attendance this month", "timestamp": (datetime.now() - timedelta(hours=2)).isoformat(), "icon": "award"},
            {"id": "2", "type": "info", "message": "New teacher Jane Smith assigned to Math classes", "timestamp": (datetime.now() - timedelta(days=1)).isoformat(), "icon": "user"},
            {"id": "3", "type": "info", "message": "Science lab equipment maintenance completed", "timestamp": (datetime.now() - timedelta(days=2)).isoformat(), "icon": "tool"}
        ]
    elif current_user.role == UserRole.TEACHER:
        activities = [
            {"id": "1", "type": "success", "message": "Attendance marked for Class 10A", "timestamp": (datetime.now() - timedelta(hours=1)).isoformat(), "icon": "check"},
            {"id": "2", "type": "info", "message": "Exam marks submitted for Math test", "timestamp": (datetime.now() - timedelta(hours=3)).isoformat(), "icon": "grade"}
        ]

    return activities


@router.get("/performance-data")
async def get_performance_data(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session)
) -> List[Dict[str, Any]]:
    
    performance_data: List[Dict[str, Any]] = []


    if current_user.role == UserRole.ADMIN:
        #if district admin show average marks per subject across all schools in the table
        result = await session.exec(
            select(Subject.name, func.avg(Marks.marks))
            .join(Marks, Marks.subject_id == Subject.id)
            .group_by(Subject.id, Subject.name)
        )
        for subject_name, avg_marks in result.all():
            performance_data.append({
                "subject": subject_name,
                "average": round(avg_marks or 0, 1)
            })
    elif current_user.role == UserRole.PRINCIPAL:
        if not current_user.school_id:
            raise HTTPException(status_code=400, detail="Principal not linked to a school")

        results = await session.exec(
            select(Subject.name, func.avg(Marks.marks))
            .join(Marks, Marks.subject_id == Subject.id)
            .join(Class, Marks.class_id == Class.id)
            .where(Class.school_id == current_user.school_id)
            .group_by(Subject.id, Subject.name)
        )
        for subject_name, avg_marks in results.all():
            performance_data.append({
                "subject": subject_name,
                "average": round(avg_marks or 0, 1)
            })

    elif current_user.role == UserRole.TEACHER:
        teacher_res = await session.exec(
            select(Teacher).where(Teacher.email == current_user.email)
        )
        teacher = teacher_res.first()
        if not teacher:
            raise HTTPException(status_code=404, detail="Teacher not found")

        from src.models import TeacherAssignment
        assigned_subjects_res = await session.exec(
            select(Subject.name, func.avg(Marks.marks))
            .join(Marks, Marks.subject_id == Subject.id)
            .join(TeacherAssignment, TeacherAssignment.subject_id == Subject.id)
            .where(TeacherAssignment.teacher_id == teacher.id)
            .group_by(Subject.id, Subject.name)
        )

        for subject_name, avg_marks in assigned_subjects_res.all():
            performance_data.append({
                "subject": subject_name,
                "average": round(avg_marks or 0, 1)
            })
    return performance_data


@router.get("/alerts")
async def get_alerts(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session)
) -> List[Dict[str, Any]]:
    alerts = []

    if current_user.role == UserRole.ADMIN:
        #checks for low attendance for schools in last 7 days
        low_attendance_res = await session.exec(
            select(School.name)
            .join(Class, School.id == Class.school_id)
            .join(Attendance, Class.id == Attendance.class_id)
            .where(Attendance.attendance_date >= datetime.now().date() - timedelta(days=7))
            .group_by(School.id, School.name)
            #if the attendance is less than 75% alert is sent -- can be changed according to schools attendance policy
            .having(func.avg(cast(Attendance.is_present, Integer)) < 0.75)
        )
        low_attendance_schools = low_attendance_res.all()

        for school_name in low_attendance_schools:
            alerts.append({
                "id": f"attendance_{school_name}",
                "type": "warning",
                "message": f"Low attendance detected at {school_name}",
                "time": "2 hours ago"
            })

        # Low performance of schools in terms of results (average marks < 50% can be changed later)
        low_performance_res = await session.exec(
            select(School.name)
            .join(Class, School.id == Class.school_id)
            .join(Marks, Class.id == Marks.class_id)
            .group_by(School.id, School.name)
            .having(func.avg(Marks.marks)<50)
        )
        low_performance_schools = low_performance_res.all()

        for school_name in low_performance_schools:
            alerts.append({
                "id": f"performance_{school_name}",
                "type": "warning",
                "message": f"Low performance detected at {school_name}",
                "time": "2 hours ago"
            })

    #Principal alerts 
    if current_user.role == UserRole.PRINCIPAL:
        if current_user.school_id:
            #alerts for low attendance of classes in last 7 days
            low_attendance_res = await session.exec(
                select(Class.name)
                .join(Attendance, Class.id == Attendance.class_id)
                .where(Class.school_id == current_user.school_id)
                .where(Attendance.attendance_date >= datetime.now().date() - timedelta(days=7))
                .group_by(Class.id, Class.name)
                .having(func.avg(cast(Attendance.is_present, Integer)) < 0.75)
            )
            low_attendance_classes = low_attendance_res.all()

            for class_name in low_attendance_classes:
                alerts.append({
                    "id": f"attendance_class_{class_name}",
                    "type": "warning",
                    "message": f"Low attendance detected in class {class_name}",
                    "time": datetime.now().isoformat()
                })
            
            # Low performance for classes (average marks < 50%)
            low_performance_res = await session.exec(
                select(Class.name)
                .join(Marks, Class.id == Marks.class_id)
                .where(Class.school_id == current_user.school_id)
                .group_by(Class.id, Class.name)
                .having(func.avg(Marks.marks) < 50)
            )
            low_performance_classes = low_performance_res.all()

            for class_name in low_performance_classes:
                alerts.append({
                    "id": f"performance_class_{class_name}",
                    "type": "warning",
                    "message": f"Low performance detected in class {class_name}",
                    "time": datetime.now().isoformat()
                })
    # Teacher Alerts
    if current_user.role == UserRole.TEACHER:
        teacher_res = await session.exec(
            select(Teacher).where(Teacher.email == current_user.email)
        )
        teacher = teacher_res.first()

        if teacher:
            # Check student's attendance
            low_attendance_students_res = await session.exec(
                select(Student.name)
                .join(Attendance, Student.id == Attendance.student_id)
                .where(Attendance.teacher_id == teacher.id)
                .where(Attendance.attendance_date >= datetime.now().date() - timedelta(days=7))
                .group_by(Student.id, Student.name)
                .having(func.avg(cast(Attendance.is_present, Integer)) < 0.85)
            )
            low_attendance_students = low_attendance_students_res.all()

            for student_name in low_attendance_students:
                alerts.append({
                    "id": f"attendance_student_{student_name}",
                    "type": "warning",
                    "message": f"Low attendance detected for student {student_name}",
                    "time": datetime.now().isoformat()
                })

            # Check student's performance
            low_performance_students_res = await session.exec(
                select(Student.name)
                .join(Marks, Student.id == Marks.student_id)
                .where(Marks.teacher_id == teacher.id)
                .group_by(Student.id, Student.name)
                .having(func.avg(Marks.marks) < 50)
            )
            low_performance_students = low_performance_students_res.all()

            for student_name in low_performance_students:
                alerts.append({
                    "id": f"performance_student_{student_name}",
                    "type": "warning",
                    "message": f"Declining performance detected for student {student_name}",
                    "time": datetime.now().isoformat()
                })

    return alerts
