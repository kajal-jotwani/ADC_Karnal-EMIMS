from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List
from datetime import date
from src.db.main import get_session
from src.auth.dependencies import get_current_active_user, require_admin_or_principal
from src.auth.models import User, UserRole
from src.models.models import Attendance, AttendanceCreate, AttendanceResponse, Student, Class, Teacher

router = APIRouter()

#Mark attendance - uses date from teacher's chosen date
@router.post("/", response_model=List[AttendanceResponse])
async def mark_attendance(
    attendance_data: List[AttendanceCreate],
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Mark attendance for multiple students in a class on a specific date"""
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Only teachers can mark attendance")
    
    # Get the teacher's record
    teacher_results = await session.exec(select(Teacher).where(Teacher.email == current_user.email))
    teacher = teacher_results.first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher record not found")
    
    #prefetch all students involved
    student_ids = [record.student_id for record in attendance_data]
    students_result = await session.exec(select(Student).where(Student.id.in_(student_ids)))
    students = {student.id: student for student in students_result.all()}

    attendance_records = []

    for data in attendance_data:
        class_ = await session.get(Class, data.class_id)
        student = students.get(data.student_id)

        if not class_ or class_.teacher_id != teacher.id:
            raise HTTPException(status_code=403, detail=f"Access denied to class {data.class_id}")
        if not student or student.class_id != data.class_id:
            raise HTTPException(status_code=400, detail=f"Student {data.student_id} not in class {data.class_id}")
        
        # Check if attendance already marked for this student on this date
        existing_record = await session.exec(
            select(Attendance).where(
                Attendance.student_id == data.student_id,
                Attendance.class_id == data.class_id,
                Attendance.attendance_date == data.date
            )
        )
        existing = existing_record.first()

        if existing:
            existing.is_present = data.is_present
            existing.teacher_id = teacher.id
            session.add(existing)
            attendance_records.append(existing)
        else:
            new_attendance = Attendance(
                student_id=data.student_id,
                class_id=data.class_id,
                attendance_date=data.date,
                teacher_id=teacher.id,
                is_present=data.is_present
            )
            session.add(new_attendance)
            attendance_records.append(new_attendance)

    await session.commit()

    #build response
    response = [
        AttendanceResponse(
            id=record.id,
            student_id=record.student_id,
            student_name=students.get(record.student_id).name if students.get(record.student_id) else "Unknown",
            is_present=record.is_present,
            date=record.attendance_date
        ) for record in attendance_records
    ]

    return response

#Get attendance for a class on a specific date
@router.get("/class/{class_id}/date/{attendance_date}", response_model=List[AttendanceResponse])
async def get_attendance_for_class_date(
    class_id: int,
    attendance_date: date,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get attendance records for a specific class on a specific date"""
    
    class_ = await session.get(Class, class_id)
    if not class_:
        raise HTTPException(status_code=404, detail="Class not found")
    
    #permissions 
    if current_user.role == UserRole.TEACHER:
        teacher_result = await session.exec(select(Teacher).where(Teacher.email == current_user.email))
        teacher = teacher_result.first()
        if not teacher or class_.teacher_id != teacher.id:
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role == UserRole.PRINCIPAL and class_.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Access denied")
        
    attendance_result = await session.exec(
        select(Attendance, Student)
        .join(Student, Attendance.student_id == Student.id)
        .where(
            Attendance.class_id == class_id,
            Attendance.attendance_date == attendance_date
        )
    )

    return [
        AttendanceResponse(
            id=attendance.id,
            student_id=student.id,
            student_name=student.name,
            is_present=attendance.is_present,
            date=attendance.attendance_date
        )
        for attendance, student in attendance_result.all()
    ]

#get student's attendance summary 
@router.get("/student/{student_id}/summary")
async def get_student_attendance_summary(
    student_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get attendance summary for a specific student"""
    
    student = await session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    #permissions
    if current_user.role == UserRole.TEACHER:
        teacher_result = await session.exec(select(Teacher).where(Teacher.email == current_user.email))
        teacher = teacher_result.first()
        class_ = await session.get(Class, student.class_id)
        if not teacher or not class_ or class_.teacher_id != teacher.id:
            raise HTTPException(status_code=403, detail="Access denied")
        
    elif current_user.role == UserRole.PRINCIPAL:
        class_ = await session.get(Class, student.class_id)
        if not class_ or class_.school_id != current_user.school_id:
            raise HTTPException(status_code=403, detail="Access denied")
            
    attendance_result = await session.exec(
            select(Attendance)
            .where(Attendance.student_id == student_id)
        )
    records = attendance_result.all()
    total_days = len(records)
    present_days = sum(1 for record in records if record.is_present)
    attendance_percentage = (present_days / total_days * 100) if total_days > 0 else 0

    return{
        "student_id": student.id,
        "student_name": student.name,
        "total_days": total_days,
        "present_days": present_days,
        "attendance_percentage": round(attendance_percentage, 2)
    }