"""
Analytics API endpoints
Provides data for charts and visualizations
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlmodel import select, func
from sqlmodel.ext.asyncio.session import AsyncSession
from typing import List, Dict, Any, Optional
from src.db.main import get_session
from src.auth.dependencies import get_current_active_user, require_admin
from src.auth.models import User, UserRole
from src.models import Student, Class, School, Subject, Marks, TeacherAssignment

router = APIRouter()

# Subject performance per school
@router.get("/subject-performance")
async def get_subject_performance(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session),
    school_id: Optional[int] = Query(None)
) -> List[Dict[str, Any]]:
    
    """Average marks by subjects for a school"""
    if current_user.role == UserRole.PRINCIPAL:
        school_id = current_user.school_id
    elif current_user.role == UserRole.TEACHER:
        # Get school_id from teacher's assigned classes
        teacher_class = (await session.exec(
            select(Class.school_id)
            .join(TeacherAssignment, TeacherAssignment.class_id == Class.id)
            .where(TeacherAssignment.teacher_id == current_user.id)
            .limit(1)
        )).first()
        if not teacher_class:
            raise HTTPException(status_code=403, detail="No classes assigned")
        school_id = teacher_class
    elif school_id is None:
        raise HTTPException(status_code=400, detail="School ID required")
    
    query = (
        select(Subject.id, Subject.name, func.avg(Marks.marks))
        .join(Marks, Marks.subject_id == Subject.id)
        .join(Student, Marks.student_id == Student.id)
        .join(Class, Student.class_id == Class.id)
        .where(Class.school_id == school_id)
        .group_by(Subject.id, Subject.name)
    )

    results = (await session.exec(query)).all()
    return [{"subject_id": sid, "subject": name, "average": round(avg or 0, 1)} for sid, name, avg in results]

#class performance 
@router.get("/class-performance")
async def get_class_performance(
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session)
) -> List[Dict[str, Any]]:
    
    """Class Wise performance with student count and subject averages"""
    class_query = select(Class)

    if current_user.role == UserRole.PRINCIPAL:
        class_query = class_query.where(Class.school_id == current_user.school_id)
    elif current_user.role == UserRole.TEACHER:
        teacher_classes = (await session.exec(
            select(Class).join(TeacherAssignment, TeacherAssignment.class_id == Class.id)
            .where(TeacherAssignment.teacher_id == current_user.id)
        )).all()
        
        #its structured so because a teacher could be assigned multiple classes
        class_query = class_query.where(Class.id.in_([c.id for c in teacher_classes]))

    classes = (await session.exec(class_query)).all()
    if not classes:
        return []
    
    class_ids = [c.id for c in classes]

    #Number of students 
    students_counts = dict(
        (await session.exec(
            select(Student.class_id, func.count(Student.id))
            .where(Student.class_id.in_(class_ids))
            .group_by(Student.class_id)
        )).all()
    )

    #subject averages per class
    results = (await session.exec(
        select(Class.id, Subject.name, func.avg(Marks.marks))
        .join(Student, Student.class_id == Class.id)
        .join(Marks, Marks.student_id == Student.id)
        .join(Subject, Marks.subject_id == Subject.id)
        .where(Class.id.in_(class_ids))
        .group_by(Class.id, Subject.name)
    )).all()


    #structured well for better api response 
    subject_avgs= {}
    for class_id, subj_name, avg in results:
        subject_avgs.setdefault(class_id, {})[subj_name] = round(avg or 0, 1)

    response = []
    for c in classes:
        response.append({
            "class_id": c.id,
            "class": f"{c.grade}{c.section}",
            "studentCount": students_counts.get(c.id, 0),
            "subjects": subject_avgs.get(c.id, {})
        })
    return response

# School comparison
@router.get("/school-comparison")
async def get_school_comparison(
    current_user: User = Depends(require_admin),
    session: AsyncSession = Depends(get_session)
) -> List[Dict[str, Any]]:
    
    """Compare schools by avg score and per-subject averages"""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin access required")

    # School stats
    school_stats = dict(
        (await session.exec(
            select(Class.school_id, func.count(Student.id), func.avg(Marks.marks))
            .join(Student, Student.class_id == Class.id)
            .join(Marks, Marks.student_id == Student.id)
            .group_by(Class.school_id)
        )).all()
    )

    # Subject stats
    results = (await session.exec(
        select(Class.school_id, Subject.name, func.avg(Marks.marks))
        .join(Student, Student.class_id == Class.id)
        .join(Marks, Marks.student_id == Student.id)
        .join(Subject, Marks.subject_id == Subject.id)
        .group_by(Class.school_id, Subject.name)
    )).all()

    subject_avgs = {}
    for school_id, subj_name, avg in results:
        subject_avgs.setdefault(school_id, {})[subj_name] = round(avg or 0, 1)

    schools = (await session.exec(select(School))).all()

    response = []
    for school in schools:
        student_count, avg_score = school_stats.get(school.id, (0, 0))
        response.append({
            "school_id": school.id,
            "school": school.name,
            "averageScore": round(avg_score or 0, 1),
            "studentCount": student_count,
            "subjects": subject_avgs.get(school.id, {})
        })

    return sorted(response, key=lambda x: x["averageScore"], reverse=True)

# Student progress
@router.get("/student-progress/{student_id}")
async def get_student_progress(
    student_id: int,
    current_user: User = Depends(get_current_active_user),
    session: AsyncSession = Depends(get_session)
) -> List[Dict[str, Any]]:
    
    """Term-wise progression per subject for a student"""
    
    # Fetch the student
    student = await session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if current_user.role == UserRole.PRINCIPAL:
        class_obj = await session.get(Class, student.class_id)
        if not class_obj or class_obj.school_id != current_user.school_id:
            raise HTTPException(status_code=403, detail="Access denied")

    elif current_user.role == UserRole.TEACHER:
        assigned_classes = (await session.exec(
            select(TeacherAssignment.class_id)
            .where(TeacherAssignment.teacher_id == current_user.id)
        )).all()
        if student.class_id not in assigned_classes:
            raise HTTPException(status_code=403, detail="Access denied")

    # Query average marks per exam type and subject
    results = (await session.exec(
        select(Marks.exam_type, Subject.name, func.avg(Marks.marks))
        .join(Subject, Marks.subject_id == Subject.id)
        .where(Marks.student_id == student_id)
        .group_by(Marks.exam_type, Subject.name)
        .order_by(Marks.exam_type)
    )).all()

    # Organize data
    progress = {}
    for exam_type, subject_name, avg in results:
        progress.setdefault(exam_type, {})[subject_name] = round(avg or 0, 1)

    # Define term order for consistent output
    term_order = ["term1", "term2", "term3", "final", "midterm", "quiz", "custom"]
    return [
        {"term": t, "subjects": progress.get(t, {})}
        for t in term_order if t in progress
    ]
