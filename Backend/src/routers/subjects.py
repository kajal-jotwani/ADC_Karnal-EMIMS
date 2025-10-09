from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from typing import List
from src.auth.models import User, UserRole
from src.auth.dependencies import get_current_active_user, require_admin_or_principal
from src.db.main import get_session
from src.models import Subject, SubjectCreate, SubjectUpdate

router = APIRouter(prefix="/subjects", tags=["Subjects"])

# Create a subject
@router.post("/", response_model=Subject)
async def create_subject(
    subject: SubjectCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_admin_or_principal)
):
    db_subject = Subject(**subject.dict())
    session.add(db_subject)
    await session.commit()
    await session.refresh(db_subject)
    return db_subject

# List all subjects
@router.get("/", response_model=List[Subject])
async def list_subjects(
    session: AsyncSession = Depends(get_session),
    curent_user: User = Depends(get_current_active_user)
    ):
    result = await session.exec(select(Subject))
    subjects = result.all()
    return subjects

# Get a single subject by ID
@router.get("/{subject_id}", response_model=Subject)
async def get_subject(
    subject_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
    ):
    subject = await session.get(Subject, subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    return subject

# Update a subject -> only admin or school Principal can edit this usually for Principal dashboard
@router.put("/{subject_id}", response_model=Subject)
async def update_subject(
    subject_id: int, 
    subject_update: SubjectUpdate, 
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_admin_or_principal)
    ):
    subject = await session.get(Subject, subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    for field, value in subject_update.dict(exclude_unset=True).items():
        setattr(subject, field, value)
    
    session.add(subject)
    await session.commit()
    await session.refresh(subject)
    return subject

# Delete a subject
@router.delete("/{subject_id}")
async def delete_subject(
    subject_id: int, 
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_admin_or_principal)
    ):
    subject = await session.get(Subject, subject_id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    
    await session.delete(subject)
    await session.commit()
    return {"message": "Subject deleted successfully"}
