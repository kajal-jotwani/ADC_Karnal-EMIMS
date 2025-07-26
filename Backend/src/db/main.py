from sqlmodel import create_engine, SQLModel
from sqlalchemy.ext.asyncio import AsyncEngine
from sqlmodel.ext.asyncio.session import AsyncSession 

from src.config import Config

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