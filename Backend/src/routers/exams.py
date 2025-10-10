from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from src.db.main import get_session
from src.models.models import(
    Exam, ExamCreate, ExamResponse, ExamMarks, ExamMarksCreate,
    Student, Subject, Class, Teacher
)
from src.auth.dependencies import get_current_active_user
from src.auth.models import User, UserRole

router = APIRouter()

#helper function to fetch teacher by current user
async def get_current_teacher(current_user: User, session: AsyncSession) -> Teacher:
    if current_user.role != UserRole.teacher:
        raise HTTPException(status_code=403, detail="Only teachers can perform this action")
    result = await session.exec(select(Teacher).where(Teacher.user_id == current_user.id))
    teacher = result.first()
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher profile not found")
    return teacher  

#create exam
@router.post("/", response_model=ExamResponse)
async def create_exam(
    exam_data: ExamCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    teacher = await get_current_teacher(current_user, session)
    
    # Verify class assignment
    class_ = await session.get(Class, exam_data.class_id)
    if not class_ or class_.teacher_id != teacher.id:
        raise HTTPException(status_code=403, detail="You are not assigned to this class")
    
    exam_data.teacher_id = teacher.id
    db_exam  =Exam(**exam_data.model_dump())
    session.add(db_exam)
    await session.commit()
    await session.refresh(db_exam)

    #prefetch subject and class for response
    subject = await session.get(Subject, db_exam.subject_id)
    return ExamResponse(
        id=db_exam.id,
        name=db_exam.name,
        subject_name=subject.name if subject else "Unknown",
        class_name=class_.name if class_ else "Unknown",
        max_marks=db_exam.max_marks,
        exam_date=db_exam.exam_date,
        created_at=db_exam.created_at
    )

#get exams for teacher's classes by id
@router.get("/teacher/{teacher_id}")
async def get_teacher_exams(
    teacher_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    #teacher or principle can access
    if current_user.role == UserRole.TEACHER:
        teacher = await get_current_teacher(current_user, session)
        if teacher.id != teacher_id:
            raise HTTPException(status_code=403, detail="You can only access your own exams")
    elif current_user.role != UserRole.PRINCIPLE:
        teacher = await session.get(Teacher, teacher_id)
        if not teacher or teacher.school_id != current_user.school_id:
            raise HTTPException(status_code=403, detail="You can only access exams from your school")
    
    exam_result = await session.exec(
        select(Exam, Subject,Class)
        .join(Subject, Exam.subject_id == Subject.id)
        .join(Class, Exam.class_id == Class.id)
        .where(Exam.teacher_id == teacher_id)
    )
    exam = exam_result.all()

    return [
        {
            "id": exam.id,
            "name": exam.name,
            "subject_name": subject.name,
            "class_name": class_.name,
            "max_marks": exam.max_marks,
            "exam_date": exam.exam_date,
            "created_at": exam.created_at
        }
        for exam, subject, class_ in exam
    ]

#get my exams
@router.get("/me")
async def get_my_exams(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    teacher = await get_current_teacher(current_user, session)
    return await get_teacher_exams(teacher.id, session, current_user)   

#submit exam marks -- bulk insert
@router.post("/marks", response_model=List[dict])
async def submit_exam_marks(
    marks_list: List[ExamMarksCreate],
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    teacher = await get_current_teacher(current_user, session)
    
    Student_ids = [marks.student_id for marks in marks_list]
    students_result = await session.exec(
        select(Student).where(Student.id.in_(Student_ids))
    )
    students_map = {student.id: student for student in students_result.all()}   

    marks_records = []
    for marks_data in marks_list:
        exam = await session.get(Exam, marks_data.exam_id)
        if not exam or exam.teacher_id != teacher.id:
            raise HTTPException(status_code=403, detail=f"You are not authorized to submit marks for exam ID {marks_data.exam_id}")
        
        student = students_map.get(marks_data.student_id)
        if not student or student.class_id != exam.class_id:
            raise HTTPException(status_code=400, detail=f"Student ID {marks_data.student_id} is not in the exam's class")
        
        existing_result = await session.exec(
            select(ExamMarks)
            .where(ExamMarks.exam_id == marks_data.exam_id)
            .where(ExamMarks.student_id == marks_data.student_id)
        )
        existing = existing_result.first()

        if existing:
            existing.marks_obtained = marks_data.marks_obtained
            session.add(existing)
            marks_records.append(existing)
        else:
            new_marks = ExamMarks(**marks_data.model_dump())
            session.add(new_marks)
            marks_records.append(new_marks)

    await session.commit()
    for record in marks_records:
        await session.refresh(record)
    
    response = []
    for record in marks_records:
        student = students_map.get(record.student_id)
        response.append({
            "id": record.id,
            "student_id": record.student_id,
            "student_name": student.name if student else "Unknown",
            "marks_obtained": record.marks_obtained,
        })
    return response

#get exam marks by exam id
@router.get("/{exam_id}/marks")
async def get_exam_marks(
    exam_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    
    exam = await session.get(Exam, exam_id)
    if not exam :
        raise HTTPException(status_code=403, detail="Exam not found")
    
    if current_user.role == UserRole.TEACHER:
        teacher = await get_current_teacher(current_user, session)
        if exam.teacher_id != teacher.id:
            raise HTTPException(status_code=403, detail="You are not authorized to view marks for this exam")
    elif current_user.role == UserRole.PRINCIPAL:
        class_ = await session.get(Class, exam.class_id)
        if not class_ or class_.school_id != current_user.school_id:
            raise HTTPException(status_code=403, detail="You are not authorized to view marks for this exam")
    
    marks_result = await session.exec(
        select(ExamMarks, Student)
        .join(Student, ExamMarks.student_id == Student.id)
        .where(ExamMarks.exam_id == exam_id)
    )
    marks = marks_result.all()  
    return [
        {
            "student_id": student.id,
            "student_name": student.name,
            "roll_number": student.roll_number,
            "marks_obtained": exam_marks.marks_obtained
        } for exam_marks, student in marks
    ]

#student's exam performance
@router.get("/student/{student_id}/performance")
async def get_student_performance(
    student_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    student = await session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    class_ = await session.get(Class, student.class_id)
    if not class_:
        raise HTTPException(status_code=404, detail="Class not found")
    
    if current_user.role == UserRole.TEACHER:
        teacher = await get_current_teacher(current_user, session)
        if class_.teacher_id != teacher.id:
            raise HTTPException(status_code=403, detail="You are not authorized to view this student's performance")
    elif current_user.role == UserRole.PRINCIPAL:
        if class_.school_id != current_user.school_id:
            raise HTTPException(status_code=403, detail="You are not authorized to view this student's performance")
        
    performance_result = await session.exec(
        select(ExamMarks, Exam, Subject)
        .join(Exam, ExamMarks.exam_id == Exam.id)
        .join(Subject, Exam.subject_id == Subject.id)
        .where(ExamMarks.student_id == student_id)
    )
    performance = performance_result.all()

    return [
        {
            "exam_name": exam.name,
            "subject_name": subject.name,
            "marks_obtained": exam_marks.marks_obtained,
            "max_marks": exam.max_marks,
            "exam_date": exam.exam_date,
            "percentage": round((exam_marks.marks_obtained / exam.max_marks) * 100, 2),
            "created_at": exam.created_at
        } for exam_marks, exam, subject in performance
    ]