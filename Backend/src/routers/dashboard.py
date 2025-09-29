"""
Dahsboard API endpoints
Provides aggregated data for dashboard views
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from typing import Dict, Any
from datetime import datetime, timedelta
from src.db.main import get_session
from src.auth.dependencies import get_current_active_user, require_admin, require_admin_or_principal
from src.auth.models import User, UserRole
from src.models import School, Teacher, Student, Class, Attendance, Marks, Subject

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """
    This endpoint gives dashboard stats based on user role
    """
    stats = {}

    if current_user.role == UserRole.ADMIN:
        #admin can see the district wise stats
        stats = {
            #counts the number of rows in the db table
            "total_schools": 
            session.exec(select(func.count(School.id))).first() or 0,
            "total_students":
            session.exec(select(func.count(Student.id))).first() or 0,
            "total_teachers":
            session.exec(select(func.count(Teacher.id))).first() or 0,
            "total_subjects":
            session.exec(select(func.count(Subject.id))).first() or 0,
        }

        #calculate average attendance 
        avg_attendance = session.exec(
            select(func.avg(func.cast(Attendance.is_present, float)*100))
            .where(Attendance.attendance_date >= datetime.now().date() - timedelta(days=30))
        ).first()
        stats["average_attendance"] = round(avg_attendance or 0, 1)

    elif current_user.role == UserRole.PRINCIPAL:
        #Principal can see their school-specific stats
        if current_user.school_id:
            stats = {
                "total_students": session.exec(
                    select(func.count(Student.id))
                    .join(Class, Student.class_id == Class.id)
                    .where(Class.School_id == current_user.School_id)
                ).first() or 0,
                "total_teachers": session.exec(
                    select(func.count(Teacher.id))
                    .where(Teacher.school_id == current_user.school_id)
                ).first() or 0,
                "total_classes": session.exec(
                    select(func.count(Class.id))
                    .where(Class.school_id == current_user.school_id)
                ).first() or 0,
            }

            #school-specific attendance
            avg_attendance = session.exec(
                select(func.avg(func.cast(Attendance.is_present, float)*100))
                .join(Class, Attendance.class_id == Class.id)
                .where(Class.school_id == current_user.school_id)
                .where(Attendance.attendance_date >= datetime.now().date() - timedelta(days=30))
            ).first()
            stats["average_attendance"] = round(avg_attendance or 0, 1)

    elif current_user.role == UserRole.TEACHER:
        #Teacher sees their class stats
        teacher = session.exec(
            select(Teacher).where(Teacher.email == current_user.email)
        ).first()

        if teacher:
            #get classes taught by the particular teacher
            from models import TeacherAssignment
            class_ids = session.exec(
                select(TeacherAssignment.class_id)
                .where(TeacherAssignment.teacher_id == teacher.id)
            ).all()

            stats = {
                "total_students": session.exec(
                    select(func.count(Student.id))
                    .where(Student.class_id.in_(class_ids))
                ).first() or 0,
                "total_classes": len(class_ids),
                "subjects_taught": session.exec(
                    select(func.count(func.distinct(TeacherAssignment.subject_id)))
                    .where(TeacherAssignment.teacher_id == teacher.id)
                ).first() or 0,
            }
    return stats


