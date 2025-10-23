from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import Any, Dict, List
from pydantic import BaseModel

from src.db.main import get_session
from src.auth.models import User, UserRole
from src.auth.dependencies import get_current_active_user, require_admin_or_principal
from src.models.models import TeacherAssignment, Teacher, Subject, Class

router = APIRouter()

# Request model
class TeacherAssignmentCreate(BaseModel):
    teacher_id: int
    class_id: int
    subject_id: int

# Create teacher assignment
@router.post("/", response_model=TeacherAssignment)
async def create_teacher_assignment(
    assignment_data: TeacherAssignmentCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_admin_or_principal)
):
    """Assign a teacher to teach a subject in a class"""
    # Verify teacher exists
    teacher = await session.get(Teacher, assignment_data.teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    # Verify class exists
    class_ = await session.get(Class, assignment_data.class_id)
    if not class_:
        raise HTTPException(status_code=404, detail="Class not found")
    
    # Verify subject exists
    subject = await session.get(Subject, assignment_data.subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    # Check if principal is trying to assign outside their school
    if current_user.role == UserRole.PRINCIPAL:
        if class_.school_id != current_user.school_id or teacher.school_id != current_user.school_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    # Check if assignment already exists
    existing = await session.exec(
        select(TeacherAssignment)
        .where(TeacherAssignment.class_id == assignment_data.class_id)
        .where(TeacherAssignment.subject_id == assignment_data.subject_id)
    )
    existing_assignment = existing.first()
    
    if existing_assignment:
        raise HTTPException(
            status_code=400, 
            detail="This subject is already assigned to a teacher in this class. Please remove the existing assignment first."
        )
    
    # Create assignment
    assignment = TeacherAssignment(
        teacher_id=assignment_data.teacher_id,
        class_id=assignment_data.class_id,
        subject_id=assignment_data.subject_id
    )
    session.add(assignment)
    await session.commit()
    await session.refresh(assignment)
    
    return assignment

# Get assignments for a class
@router.get("/class/{class_id}", response_model=List[TeacherAssignment])
async def get_class_assignments(
    class_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get all teacher assignments for a class"""
    class_ = await session.get(Class, class_id)
    if not class_:
        raise HTTPException(status_code=404, detail="Class not found")
    
    if current_user.role == UserRole.PRINCIPAL and class_.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    statement = select(TeacherAssignment).where(TeacherAssignment.class_id == class_id)
    result = await session.exec(statement)
    assignments = result.all()
    
    return assignments

# Delete assignment
@router.delete("/{assignment_id}")
async def delete_assignment(
    assignment_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_admin_or_principal)
):
    """Delete a teacher assignment"""
    assignment = await session.get(TeacherAssignment, assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    
    # Verify access
    if current_user.role == UserRole.PRINCIPAL:
        class_ = await session.get(Class, assignment.class_id)
        if class_ and class_.school_id != current_user.school_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    await session.delete(assignment)
    await session.commit()
    
    return {"message": "Assignment deleted successfully"}

# Get subjects assigned to current logged-in teacher
@router.get("/me/subjects")
async def get_my_teacher_subjects(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
) -> List[Dict[str, Any]]:
    """
    Get all subjects assigned to the currently logged-in teacher.
    Returns class, subject, and related info.
    """
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Only teachers can access this endpoint")
    
    # Find teacher by email (since user.id != teacher.id)
    teacher_result = await session.exec(
        select(Teacher).where(Teacher.email == current_user.email)
    )
    teacher = teacher_result.first()
    
    if not teacher:
        raise HTTPException(
            status_code=404, 
            detail="Teacher profile not found. Please contact your administrator."
        )
    
    # Query all assignments for this teacher
    query = (
        select(
            TeacherAssignment,
            Class,
            Subject
        )
        .join(Class, Class.id == TeacherAssignment.class_id)
        .join(Subject, Subject.id == TeacherAssignment.subject_id)
        .where(TeacherAssignment.teacher_id == teacher.id)
    )

    result = await session.exec(query)
    rows = result.all()

    # Build a structured response
    assignments = [
        {
            "assignment_id": assignment.id,
            "class_id": class_.id,
            "class_name": class_.name,
            "grade": class_.grade,
            "section": class_.section,
            "subject_id": subject.id,
            "subject_name": subject.name,
        }
        for assignment, class_, subject in rows
    ]
    
    return assignments

# Get subjects assigned to a specific teacher (for principals/admins)
@router.get("/{teacher_id}/subjects")
async def get_teacher_subjects(
    teacher_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
) -> List[Dict[str, Any]]:
    """
    Get all subjects assigned to a specific teacher.
    Returns class, subject, and related info.
    For use by principals and admins.
    """
    # Fetch teacher
    teacher = await session.get(Teacher, teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    # Ensure principal is accessing within their school
    if current_user.role == UserRole.PRINCIPAL:
        if teacher.school_id != current_user.school_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    # Teachers can only view their own data
    if current_user.role == UserRole.TEACHER:
        teacher_self_result = await session.exec(
            select(Teacher).where(Teacher.email == current_user.email)
        )
        self_teacher = teacher_self_result.first()
        if not self_teacher or self_teacher.id != teacher_id:
            raise HTTPException(status_code=403, detail="Access denied")

    # Query all assignments for this teacher
    query = (
        select(
            TeacherAssignment,
            Class,
            Subject
        )
        .join(Class, Class.id == TeacherAssignment.class_id)
        .join(Subject, Subject.id == TeacherAssignment.subject_id)
        .where(TeacherAssignment.teacher_id == teacher_id)
    )

    result = await session.exec(query)
    rows = result.all()

    # Build a structured response
    assignments = [
        {
            "assignment_id": assignment.id,
            "class_id": class_.id,
            "class_name": class_.name,
            "grade": class_.grade,
            "section": class_.section,
            "subject_id": subject.id,
            "subject_name": subject.name,
        }
        for assignment, class_, subject in rows
    ]
    
    return assignments