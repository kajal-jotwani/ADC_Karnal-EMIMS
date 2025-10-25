from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from src.auth.models import User, UserRole
from src.auth.dependencies import get_current_active_user, require_admin_or_principal, require_admin, require_principal
from src.db.main import get_session
from src.models.models import (
    Class, Marks, School, District, SchoolCreate, Student, 
    Subject, Teacher, SchoolDetailResponse
)

router = APIRouter()

# List all schools -> only district admin can view all schools 
@router.get("/", response_model=List[School])
async def list_schools(
    district_id: Optional[int] = None,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    statement = select(School)
    if district_id is not None:
        statement = statement.where(School.district_id == district_id)
    
    result = await session.exec(statement)
    schools = result.all()
    return schools

# Principals can get their own school
@router.get("/my-school", response_model=School)
async def get_my_school(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_principal)
):
    school = await session.get(School, current_user.school_id)
    if not school: 
        raise HTTPException(status_code=404, detail="School not found")
    return school

# ⚠️ IMPORTANT: This endpoint MUST come BEFORE /{school_id}
# Get detailed school information
@router.get("/{school_id}/details", response_model=SchoolDetailResponse)
async def get_school_details(
    school_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_admin_or_principal)
):
    """Get detailed school information including stats, teachers, and performance"""
    
    # Get school
    school = await session.get(School, school_id)
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    # Check access
    if current_user.role == UserRole.PRINCIPAL and current_user.school_id != school_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get stats
    total_students = (await session.exec(
        select(func.count(Student.id))
        .join(Class, Student.class_id == Class.id)
        .where(Class.school_id == school_id)
    )).first() or 0
    
    total_teachers = (await session.exec(
        select(func.count(Teacher.id))
        .where(Teacher.school_id == school_id)
    )).first() or 0
    
    total_classes = (await session.exec(
        select(func.count(Class.id))
        .where(Class.school_id == school_id)
    )).first() or 0
    
    # Average performance
    avg_marks = (await session.exec(
        select(func.avg(Marks.marks))
        .join(Student, Marks.student_id == Student.id)
        .join(Class, Student.class_id == Class.id)
        .where(Class.school_id == school_id)
    )).first() or 0
    
    # Get teachers with their assignments
    teachers_result = await session.exec(
        select(Teacher)
        .where(Teacher.school_id == school_id)
        .limit(10)
    )
    teachers_list = []
    for teacher in teachers_result.all():
        # Get classes taught
        classes_taught = (await session.exec(
            select(Class.name)
            .where(Class.teacher_id == teacher.id)
        )).all()
        
        teachers_list.append({
            "id": teacher.id,
            "name": teacher.name,
            "email": teacher.email,
            "phone": teacher.phone,
            "classes": [c for c in classes_taught]
        })
    
    # Get classes
    classes_result = await session.exec(
        select(Class)
        .where(Class.school_id == school_id)
    )
    classes_list = []
    for class_ in classes_result.all():
        student_count = (await session.exec(
            select(func.count(Student.id))
            .where(Student.class_id == class_.id)
        )).first() or 0
        
        classes_list.append({
            "id": class_.id,
            "name": class_.name,
            "grade": class_.grade,
            "section": class_.section,
            "student_count": student_count
        })
    
    # Subject performance
    subject_perf_result = await session.exec(
        select(Subject.name, func.avg(Marks.marks))
        .join(Marks, Marks.subject_id == Subject.id)
        .join(Student, Marks.student_id == Student.id)
        .join(Class, Student.class_id == Class.id)
        .where(Class.school_id == school_id)
        .group_by(Subject.id, Subject.name)
    )
    
    subject_performance = []
    for subject_name, avg in subject_perf_result.all():
        subject_performance.append({
            "subject": subject_name,
            "average": round(avg or 0, 1)
        })
    
    return SchoolDetailResponse(
        id=school.id,
        name=school.name,
        address=school.address,
        phone=school.phone,
        email=school.email,
        district_id=school.district_id,
        stats={
            "total_students": total_students,
            "total_teachers": total_teachers,
            "total_classes": total_classes,
            "average_performance": round(avg_marks or 0, 1)
        },
        teachers=teachers_list,
        classes=classes_list,
        subject_performance=subject_performance
    )

# Get a single school by ID
@router.get("/{school_id}", response_model=School)
async def get_school(
    school_id: int, 
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_admin_or_principal)
):
    school = await session.get(School, school_id)
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    if current_user.role == UserRole.PRINCIPAL and current_user.school_id != school_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return school

# Create a new school -> Only admins are allowed 
@router.post("/", response_model=School)
async def create_school(
    school: SchoolCreate, 
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_admin)
):
    db_school = School(**school.dict())
    session.add(db_school)
    await session.commit()
    await session.refresh(db_school)
    return db_school