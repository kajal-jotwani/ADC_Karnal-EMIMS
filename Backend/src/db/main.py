from sqlmodel import create_engine, SQLModel
from sqlalchemy.ext.asyncio import AsyncEngine
from sqlmodel.ext.asyncio.session import AsyncSession 
from sqlalchemy.orm import sessionmaker

from src.config import Config

#Importing all models 
from .models import(
    District, School, SchoolClass, Teacher, Student, Subject,
    TeacherAssignment, StudentSubject, Marks, Attendance   
)

async_engine = AsyncEngine(
    create_engine(
        url=Config.DATABASE_URL,
        echo=True,
    )
)

async def init_db():
    async with async_engine.begin() as conn:
        # Create all tables in the database
        await conn.run_sync(SQLModel.metadata.create_all)
    print("Database initialized successfully.")

async def get_session() -> AsyncSession:
    Session = sessionmaker(
        bind=async_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async with Session() as session:
        yield session