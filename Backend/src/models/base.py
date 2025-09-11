from datetime import datetime, timezone
from enum import Enum
import uuid
from sqlmodel import SQLModel, Field


class Role(str, Enum):
    DISTRICT_ADMIN = "district_admin"
    PRINCIPAL = "principal"
    TEACHER = "teacher"


class AttendanceStatus(str, Enum):
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"


class BaseModel(SQLModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True, index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
    is_deleted: bool = Field(default=False)
