from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select, func
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List, Optional

from src.db.main import get_session
from src.auth.models import User, UserRole
from src.auth.dependencies import get_current_active_user, require_admin_or_principal
from src.models.models import Class, ClassCreate, ClassResponse, Teacher, Student, StudentResponse, StudentCreate

router = APIRouter()

# utility -> Role-based access check 
async def verify_class_access(current_user: User, class_: Class, session: AsyncSession):
    if current_user.role == UserRole.PRINCIPAL and class_.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role == UserRole.TEACHER:
        teacher = (await session.exec(select(Teacher).where(Teacher.email == current_user.email))).first()
        if not teacher or class_.teacher_id != teacher.id:
            raise HTTPException(status_code=403, detail="Access denied")
        

# Create a class
@router.post("/", response_model=ClassResponse)
async def create_class(
    class_create: ClassCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_admin_or_principal)
):
    """create a new class and assign it to a teacher"""
    teacher = await session.get(Teacher, class_create.teacher_id)
    if not teacher: 
        raise HTTPException(status_code=404, detail="Teacher not found")
    
    if current_user.role == UserRole.PRINCIPAL and teacher.school_id != current_user.school_id:
        raise HTTPException(status_code=403, detail="Cannot assign teacher from another school")
    
    db_class = Class(**class_create.model_dump())
    session.add(db_class)
    await session.commit()
    await session.refresh(db_class)

    return ClassResponse(
        id=db_class.id,
        name=db_class.name,
        grade=db_class.grade,
        section=db_class.section,
        school_id=db_class.school_id,
        teacher_id=db_class.teacher_id,
        teacher_name=teacher.name,
        student_count=0
    )

# List all classes
@router.get("/", response_model=List[ClassResponse])
async def list_classes(
    school_id: Optional[int] = None,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """List all classes, with optional filtering by school_id"""
    
    if current_user.role == UserRole.PRINCIPAL:
        school_id = current_user.school_id
    
    statement = select(Class)
    if school_id: 
        statement = statement.where(Class.school_id == school_id)

    classes = (await session.exec(statement)).all()

    #preload student counts 
    counts_query = select(Student.class_id, func.count(Student.id)).group_by(Student.class_id)
    counts = dict(await session.exec(counts_query))

    result = []
    for class_ in classes:
        teacher = await session.get(Teacher, class_.teacher_id) if class_.teacher_id else None
        result.append(ClassResponse(
            id=class_.id,
            name=class_.name,
            grade=class_.grade,
            section=class_.section,
            school_id=class_.school_id,
            teacher_id=class_.teacher_id,
            teacher_name=teacher.name if teacher else None,
            student_count=counts.get(class_.id, 0)
        ))  
    return result

# Get a single class by ID
@router.get("/{class_id}", response_model=ClassResponse)
async def get_class(
    class_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get detailed class information by ID"""
    class_ = await session.get(Class, class_id)
    if not class_:
        raise HTTPException(status_code=404, detail="Class not found")
    
    await verify_class_access(current_user, class_, session)

    teacher = await session.get(Teacher, class_.teacher_id) if class_.teacher_id else None
    student_count = (await session.exec(
        select(func.count(Student.id)).where(Student.class_id == class_.id)
    )).first() or 0
    
    return ClassResponse(
        id=class_.id,
        name=class_.name,
        grade=class_.grade,
        section=class_.section,
        school_id=class_.school_id,
        teacher_id=class_.teacher_id,
        teacher_name=teacher.name if teacher else None,
        student_count=student_count 
    )

#delete a class
@router.delete("/{class_id}")
async def delete_class(
    class_id: int,
    confirm: bool = False,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_admin_or_principal)
):
    """Delete a class by ID (only Admin or Principal, with optional confirmation)."""
    class_ = await session.get(Class, class_id)
    if not class_:
        raise HTTPException(status_code=404, detail="Class not found")

    await verify_class_access(current_user, class_, session)

    # Check if class has students
    student_count = (
        await session.exec(select(func.count(Student.id)).where(Student.class_id == class_.id))
    ).first() or 0

    # Prevent accidental deletion if students exist
    if student_count > 0 and not confirm:
        raise HTTPException(
            status_code=400,
            detail=f"Class has {student_count} students. "
                   f"Add '?confirm=true' to the URL to delete anyway."
        )

    # Proceed with deletion
    await session.delete(class_)
    await session.commit()

    return {
        "message": f"Class deleted successfully (and {student_count} students removed)." 
                   if student_count > 0 else "Class deleted successfully."
    }

#Add a student to a class
@router.post("/{class_id}/students", response_model=StudentResponse)
async def add_student_to_class(
    class_id: int,
    student_data: StudentCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Add a new student to a class (teacher or principal only.)"""
    class_ = await session.get(Class, class_id)
    if not class_:
        raise HTTPException(status_code=404, detail="Class not found")
    
    await verify_class_access(current_user, class_, session)

    if student_data.class_id != class_id:
        raise HTTPException(status_code=400, detail="Class ID mismatch")
    
    existing_student = (await session.exec(
        select(Student)
        .where(Student.class_id == class_id)
        .where(Student.roll_no == student_data.roll_no)
    )).first()

    if existing_student:
        raise HTTPException(status_code=400, detail="Roll number already exists in this class")
    
    #create new student
    db_student = Student(**student_data.model_dump())
    session.add(db_student)
    await session.commit()
    await session.refresh(db_student)

    return StudentResponse(
        id=db_student.id,
        name=db_student.name,
        roll_no=db_student.roll_no,
        class_id=db_student.class_id,
        class_name=class_.name,
        date_enrolled=db_student.date_enrolled
    )