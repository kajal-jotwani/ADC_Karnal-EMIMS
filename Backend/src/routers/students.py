from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List
from src.db.main import get_session
from src.auth.models import User, UserRole
from src.auth.dependencies import get_current_active_user
from src.models.models import (
    Student, StudentCreate, StudentResponse, 
    Marks, MarksCreate, Class, Teacher, TeacherAssignment
)

router = APIRouter()

# Create a new student
@router.post("/", response_model=StudentResponse)
async def create_student(
    student: StudentCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new student"""

    class_ = await session.get(Class, student.class_id)
    if not class_:
        raise HTTPException(status_code=404, detail="Class not found")
    
    if current_user.role == UserRole.TEACHER:
        teacher_results = await session.exec(select(Teacher).where(Teacher.email == current_user.email))
        teacher = teacher_results.first()
        if not teacher or class_.teacher_id != teacher.id:
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role == UserRole.PRINCIPAL:
        if class_.school_id != current_user.school_id:
            raise HTTPException(status_code=403, detail="Access denied")
        
    existing_result = await session.exec(
        select(Student).where(
            Student.class_id == student.class_id,
            Student.roll_no == student.roll_no
        )
    )
    existing_student = existing_result.first()
    if existing_student:
        raise HTTPException(status_code=400, detail="Roll number already exists in this class") 
    
    db_student = Student(**student.model_dump())
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

# List all students in a class
@router.get("/", response_model=List[StudentResponse])
async def list_students(
    class_id: int | None = None,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """List all students in a specific class"""
    
    statement = select(Student)

    if current_user.role == UserRole.TEACHER:
        teacher_results = await session.exec(select(Teacher).where(Teacher.email == current_user.email))
        teacher = teacher_results.first()
        if not teacher:
            raise HTTPException(status_code=404, detail="Teacher record not found")
        
        # Get classes where teacher is class teacher
        class_teacher_result = await session.exec(
            select(Class.id).where(Class.teacher_id == teacher.id)
        )
        class_teacher_classes = list(class_teacher_result.all())
        
        # Get classes where teacher has subject assignments
        subject_teacher_result = await session.exec(
            select(TeacherAssignment.class_id)
            .where(TeacherAssignment.teacher_id == teacher.id)
            .distinct()
        )
        subject_teacher_classes = list(subject_teacher_result.all())
        
        # Combine both lists (remove duplicates)
        all_teacher_classes = list(set(class_teacher_classes + subject_teacher_classes))
        
        if not all_teacher_classes:
            return []
        
        statement = statement.where(Student.class_id.in_(all_teacher_classes))

    elif current_user.role == UserRole.PRINCIPAL:
        school_classes_result = await session.exec(
            select(Class.id).where(Class.school_id == current_user.school_id)
        )
        school_classes = school_classes_result.all()
        if not school_classes:
            return []
        
        statement = statement.where(Student.class_id.in_(school_classes))
    
    if class_id:
        statement = statement.where(Student.class_id == class_id)

    students_result = await session.exec(statement)
    students = students_result.all()    

    #prefetch classes for names
    class_ids = list({s.class_id for s in students})
    classes_result = await session.exec(
        select(Class).where(Class.id.in_(class_ids))
    )  
    classes_map = {c.id: c for c in classes_result.all()}

    return [StudentResponse(
        id=s.id,
        name=s.name,
        roll_no=s.roll_no,
        class_id=s.class_id,
        class_name=classes_map.get(s.class_id).name if classes_map.get(s.class_id) else "Unknown",
        date_enrolled=s.date_enrolled
    ) for s in students]    

#get specific student details
@router.get("/{student_id}", response_model=StudentResponse)
async def get_student(
    student_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get detailed student information by ID"""
    student = await session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    class_ = await session.get(Class, student.class_id)
    if not class_:
        raise HTTPException(status_code=404, detail="Class not found")
    
    if current_user.role == UserRole.TEACHER:
        teacher_results = await session.exec(select(Teacher).where(Teacher.email == current_user.email))
        teacher = teacher_results.first()
        if not teacher or class_.teacher_id != teacher.id:
            raise HTTPException(status_code=403, detail="Access denied")
    elif current_user.role == UserRole.PRINCIPAL:
        if class_.school_id != current_user.school_id:
            raise HTTPException(status_code=403, detail="Access denied")   

    return StudentResponse(
        id=student.id,
        name=student.name,
        roll_no=student.roll_no,
        class_id=student.class_id,
        class_name=class_.name,
        date_enrolled=student.date_enrolled
    )

#Update student     
@router.put("/{student_id}", response_model=StudentResponse)
async def update_student(   
    student_id: int,
    student_update: StudentCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Update student information"""
    student = await session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    class_ = await session.get(Class, student.class_id)
    if not class_:
        raise HTTPException(status_code=404, detail="Class not found")
    
    if current_user.role == UserRole.TEACHER:
        teacher_results = await session.exec(select(Teacher).where(Teacher.email == current_user.email))
        teacher = teacher_results.first()
        if not teacher or class_.teacher_id != teacher.id:
            raise HTTPException(status_code=403, detail="Access denied")
        
    elif current_user.role == UserRole.PRINCIPAL:
        if class_.school_id != current_user.school_id:
            raise HTTPException(status_code=403, detail="Access denied")   
    
    if student_update.class_id != student.class_id or student_update.roll_no != student.roll_no:
        existing_result = await session.exec(
            select(Student).where(
                Student.class_id == student_update.class_id,
                Student.roll_no == student_update.roll_no,
                Student.id != student.id
            )
        )
        existing_student = existing_result.first()
        if existing_student:
            raise HTTPException(status_code=400, detail="Roll number already exists in this class") 
    
    for key, value in student_update.model_dump().items():
        setattr(student, key, value)
    
    session.add(student)
    await session.commit()
    await session.refresh(student)

    updated_class = await session.get(Class, student.class_id)

    return StudentResponse(
        id=student.id,
        name=student.name,
        roll_no=student.roll_no,
        class_id=student.class_id,
        class_name=updated_class.name if updated_class else "Unknown",
        date_enrolled=student.date_enrolled
    )    

# Delete a student
@router.delete("/{student_id}")
async def delete_student(
    student_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a student by ID"""
    student = await session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    class_ = await session.get(Class, student.class_id)
    if not class_:
        raise HTTPException(status_code=404, detail="Class not found")
    
    if current_user.role == UserRole.TEACHER:
        teacher_results = await session.exec(select(Teacher).where(Teacher.email == current_user.email))
        teacher = teacher_results.first()
        if not teacher or class_.teacher_id != teacher.id:
            raise HTTPException(status_code=403, detail="Access denied")
        
    elif current_user.role == UserRole.PRINCIPAL:
        if class_.school_id != current_user.school_id:
            raise HTTPException(status_code=403, detail="Access denied") 
           
    await session.delete(student)
    await session.commit()  
    return {"message": "Student deleted successfully"}

# (Rest of the code remains the same - marks endpoints)
#Record marks for a student
@router.post("/marks", response_model=MarksCreate)
async def record_marks(
    marks: MarksCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Record marks for a student"""
    if current_user.role != UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="Only teachers can record marks")
    
    teacher_results = await session.exec(select(Teacher).where(Teacher.email == current_user.email))
    teacher = teacher_results.first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher record not found") 
    
    student = await session.get(Student, marks.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")    
    
    class_ = await session.get(Class, marks.class_id)
    if not class_ or class_.teacher_id != teacher.id:
        raise HTTPException(status_code=403, detail="Access denied to this class")
    if student.class_id != class_.id:
        raise HTTPException(status_code=400, detail="Student does not belong to this class")
    
    data = marks.model_dump()
    data['teacher_id'] = teacher.id
    db_marks = Marks(**data)

    session.add(db_marks)
    await session.commit()
    await session.refresh(db_marks)

    return db_marks

# Get marks for a student
@router.get("/{student_id}/marks", response_model=List[MarksCreate])
async def get_student_marks(   
    student_id: int,
    subject_id: int | None = None,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get all marks for a specific student"""
    student = await session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    class_ = await session.get(Class, student.class_id)
    if not class_:
        raise HTTPException(status_code=404, detail="Class not found")
    
    if current_user.role == UserRole.TEACHER:
        teacher_results = await session.exec(select(Teacher).where(Teacher.email == current_user.email))
        teacher = teacher_results.first()
        if not teacher or class_.teacher_id != teacher.id:
            raise HTTPException(status_code=403, detail="Access denied")
        
    elif current_user.role == UserRole.PRINCIPAL:
        if class_.school_id != current_user.school_id:
            raise HTTPException(status_code=403, detail="Access denied")
    
    statement = select(Marks).where(Marks.student_id == student_id)
    if subject_id:
        statement = statement.where(Marks.subject_id == subject_id)
    
    marks_result = await session.exec(statement)
    marks = marks_result.all()
    return marks