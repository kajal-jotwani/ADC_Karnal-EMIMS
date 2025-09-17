"""
Seed authentication data
Creates demo users for testing the authentication system
"""

import asyncio
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker

from src.db.main import async_engine, init_db
from src.auth.models import User, UserRole, UserStatus
from src.auth.security import security
from src.models import School
from src.models import District


async def seed_auth_data():
    """Seed the database with demo authentication data"""

    # Ensure tables exist
    await init_db()

    # Session factory
    SessionLocal = sessionmaker(
        bind=async_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async with SessionLocal() as session:
        # ✅ Check if users already exist
        result = await session.exec(select(User))
        existing_users = result.all()
        if existing_users:
            print("⚠️ Users already exist, skipping auth data seeding")
            return

        # ✅ Ensure District exists
        result = await session.exec(select(District))
        district = result.first()
        if not district:
            district = District(
                name="ADC Karnal",
                code="ADC_KARNAL"
            )
            session.add(district)
            await session.commit()
            await session.refresh(district)

        # ✅ Ensure School exists
        result = await session.exec(select(School))
        school = result.first()
        if not school:
            school = School(
                name="PM Shri School Karnal",
                code="PMSHRI_KARNAL",
                district_id=district.id,
                address="NH-44, Sector 12, Karnal",
                phone="(0184) 220-1234",
                email="info@pmshrikarnal.edu"
            )
            session.add(school)
            await session.commit()
            await session.refresh(school)

        # ✅ Demo users
        demo_users = [
            {
                "email": "admin@education.gov",
                "password": "admin123",
                "first_name": "System",
                "last_name": "Administrator",
                "role": UserRole.ADMIN,
                "school_id": None
            },
            {
                "email": "principal@pmshrikarnal.edu",
                "password": "principal123",
                "first_name": "Ravi",
                "last_name": "Mehta",
                "role": UserRole.PRINCIPAL,
                "school_id": school.id
            },
            {
                "email": "teacher1@pmshrikarnal.edu",
                "password": "teacher123",
                "first_name": "Neha",
                "last_name": "Sharma",
                "role": UserRole.TEACHER,
                "school_id": school.id
            },
            {
                "email": "teacher2@pmshrikarnal.edu",
                "password": "teacher123",
                "first_name": "Amit",
                "last_name": "Verma",
                "role": UserRole.TEACHER,
                "school_id": school.id
            }
        ]

        # ✅ Insert Users
        for user_data in demo_users:
            hashed_password = security.get_password_hash(user_data["password"])
            user = User(
                email=user_data["email"].lower(),
                hashed_password=hashed_password,
                first_name=user_data["first_name"],
                last_name=user_data["last_name"],
                role=user_data["role"],
                school_id=user_data["school_id"],
                status=UserStatus.ACTIVE,
                is_verified=True,
            )
            session.add(user)

        await session.commit()

        print("✅ Demo authentication data seeded successfully!")
        print("\nDemo accounts:")
        print("Admin: admin@education.gov / admin123")
        print("Principal: principal@pmshrikarnal.edu / principal123")
        print("Teacher 1: teacher1@pmshrikarnal.edu / teacher123")
        print("Teacher 2: teacher2@pmshrikarnal.edu / teacher123")


if __name__ == "__main__":
    asyncio.run(seed_auth_data())
