from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select, func
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List, Dict, Any, Optional
from src.db.main import get_session
from src.auth.dependencies import get_current_active_user, require_admin_or_principal
from src.auth.models import User, UserRole
from src.models.models import Teacher, Class, ClassResponse, Student

router = APIRouter()

#List all teachers 
@router.get("/", response_model=List[Teacher])
async def list_teachers(
    school_id: Optional[int] = None,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """List all teachers, optionally filtered by school_id"""
    statement = select(Teacher)
    
    if current_user.role == UserRole.PRINCIPAL:
        school_id = current_user.school_id

    if school_id:
        statement = statement.where(Teacher.school_id == school_id)

    result = await session.exec(statement)
    teachers = result.all()
    return teachers

# get classes for a specific teacher
@router.get("/{teacher_id}/classes", response_model=List[ClassResponse])
async def get_teacher_classes(
    teacher_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get classes assigned to a specific teacher"""
    teacher = await session.get(Teacher, teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    if current_user.role == UserRole.PRINCIPAL and teacher.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Access denied")

    elif current_user.role == UserRole.TEACHER:
        result = await session.exec(select(Teacher).where(Teacher.email == current_user.email))
        current_teacher = result.first()
        if not current_teacher or current_teacher.id != teacher_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
    classes_result = await session.exec(
        select(Class).where(Class.teacher_id == teacher_id)
    )
    classes = classes_result.all()

    response = []
    for class_ in classes:
        student_count = await session.exec(
            select(func.count(Student.id)).where(Student.class_id == class_.id)
        )
        count = student_count.first() or 0
        response.append(ClassResponse(
            id=class_.id,
            name=class_.name,
            grade=class_.grade,
            section=class_.section,
            school_id=class_.school_id,
            teacher_id=class_.teacher_id,
            teacher_name=teacher.name,
            student_count=count
        ))
    
    return response

#get classes for the current teacher
@router.get("/me/classes", response_model=List[ClassResponse])
async def get_my_classes(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get classes assigned to the current logged-in teacher"""
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Access denied")

    teacher = await session.exec(select(Teacher).where(Teacher.email == current_user.email)).first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher record not found")

    classes_result = await session.exec(
        select(Class).where(Class.teacher_id == teacher.id)
    )
    classes = classes_result.all()

    response = []
    for class_ in classes:
        student_count = await session.exec(
            select(func.count(Student.id)).where(Student.class_id == class_.id)
        )
        count = student_count.first() or 0
        response.append(ClassResponse(
            id=class_.id,
            name=class_.name,
            grade=class_.grade,
            section=class_.section,
            school_id=class_.school_id,
            teacher_id=class_.teacher_id,
            teacher_name=teacher.name,
            student_count=student_count
        ))
    
    return response

# Assign teacher to a class
@router.put("/classes/{class_id}/assign/{teacher_id}")
async def assign_teacher_to_class(
    class_id: int,
    teacher_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_admin_or_principal)
):
    """Assign a teacher to a class. Only admins can perform this action."""
    class_ = await session.get(Class, class_id)
    if not class_:
        raise HTTPException(status_code=404, detail="Class not found")
    
    teacher = await session.get(Teacher, teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    if current_user.role == UserRole.PRINCIPAL:
        if class_.school_id != current_user.school_id or teacher.school_id != current_user.school_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    class_.teacher_id = teacher_id
    session.add(class_)
    await session.commit()
    await session.refresh(class_)
    
    return {"detail": "Teacher assigned successfully"}