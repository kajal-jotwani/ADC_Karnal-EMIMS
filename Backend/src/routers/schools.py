from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List 
from sqlalchemy.ext.asyncio import AsyncSession
from src.auth.models import User, UserRole
from src.auth.dependencies import get_current_active_user, require_admin_or_principal, require_admin, require_principal
from src.db.main import get_session
from src.models import School, District, SchoolCreate

router = APIRouter()

# List all schools -> only district admin can view all schools 
@router.get("/", response_model=List[School])
async def list_schools(
    district_id: int = None, 
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_admin)
    ):
    statement = select(School)
    if district_id is not None:
        statement = statement.where(School.district_id == district_id)
    
    result = await session.exec(statement)
    schools = result.all()
    return schools

# Principles can get their own school
@router.get("/my-school", response_model=School)
async def get_my_school(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(require_principal)
):
    school = await session.get(School, current_user.school_id)
    if not school: 
        raise HTTPException(status_code=404, detail="School not found")
    return school

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
    
    if current_user.role == "principal" and current_user.school_id != school_id:
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

