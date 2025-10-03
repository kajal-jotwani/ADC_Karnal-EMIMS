"""
Dahsboard API endpoints
Provides aggregated data for dashboard views
"""
from fastapi import APIRouter, Depends
from sqlalchemy import func, cast, Integer
from sqlmodel import select
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
    session = Depends(get_session)
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
            class_ids = class_ids_res.all()

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


@router.get("/recent-activity")
async def get_recent_activity(
    current_user: User = Depends(get_current_active_user),
    session = Depends(get_session)
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
    session = Depends(get_session)
) -> List[Dict[str, Any]]:
    subjects_res = await session.exec(select(Subject))
    subjects = subjects_res.all()
    performance_data = []

    for subject in subjects:
        avg_marks_res = await session.exec(
            select(func.avg(Marks.marks))
            .where(Marks.subject_id == subject.id)
        )
        school_avg = round(avg_marks_res.one() or 0, 1)
        district_avg = max(0, school_avg + ((-5 + (hash(subject.name) % 10)) * 0.5))
        state_avg = max(0, district_avg + ((-3 + (hash(subject.name) % 6)) * 0.3))

        performance_data.append({
            "subject": subject.name,
            "average": school_avg,
            "district": round(district_avg, 1),
            "state": round(state_avg, 1)
        })

    return performance_data


@router.get("/alerts")
async def get_alerts(
    current_user: User = Depends(get_current_active_user),
    session = Depends(get_session)
) -> List[Dict[str, Any]]:
    alerts = []

    if current_user.role == UserRole.ADMIN:
        low_attendance_res = await session.exec(
            select(School.name)
            .join(Class, School.id == Class.school_id)
            .join(Attendance, Class.id == Attendance.class_id)
            .where(Attendance.attendance_date >= datetime.now().date() - timedelta(days=7))
            .group_by(School.id, School.name)
            .having(func.avg(cast(Attendance.is_present, Integer)) < 0.85)
        )
        low_attendance_schools = low_attendance_res.all()

        for school_name in low_attendance_schools:
            alerts.append({
                "id": f"attendance_{school_name}",
                "type": "warning",
                "message": f"Low attendance detected at {school_name}",
                "time": "2 hours ago"
            })

    if current_user.role == UserRole.PRINCIPAL:
        alerts.extend([
            {"id": "1", "type": "warning", "message": "Class 10A needs substitute teacher for Math", "time": "1 hour ago"},
            {"id": "2", "type": "info", "message": "Parent-teacher meeting scheduled for next week", "time": "1 day ago"}
        ])

    return alerts
