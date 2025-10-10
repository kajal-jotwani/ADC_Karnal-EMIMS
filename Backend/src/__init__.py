from fastapi import FastAPI
from src.db.main import init_db
from contextlib import asynccontextmanager
from src.auth.routes import auth_router 
from .middleware import register_middleware
from src.routers import dashboard, analytics, subjects, schools, classes, teachers, attendance, students, exams

@asynccontextmanager
async def life_span(app: FastAPI):
    print(f"server is starting up")
    await init_db()
    yield
    print(f"server is shutting down")

version = "v1"

app = FastAPI(
    title="EMIMS Backend",
    description="Backend for EMIMS (Education Management Information System)",
    version=version,
    lifespan=life_span
)

register_middleware(app)

@app.get("/")
async def root():
    return {"message": "Welcome to the Education Management system backend"}

@app.get("/api/v1/health")
async def health_check():
    return {"status": "Healthy", "message": "Backend is running 🚀"}

app.include_router(auth_router, prefix=f"/api/{version}/auth", tags=["auth"])
app.include_router(dashboard.router, prefix=f"/api/{version}/routers/dashboard", tags=["dashboard"])
app.include_router(analytics.router, prefix=f"/api/{version}/routers/analytics", tags=["analytics"])
app.include_router(subjects.router, prefix=f"/api/{version}/routers/subjects", tags=["subjects"])
app.include_router(schools.router, prefix=f"/api/{version}/routers/schools", tags=["schools"])
app.include_router(classes.router, prefix=f"/api/{version}/routers/classes", tags=["classes"])
app.include_router(teachers.router, prefix=f"/api/{version}/routers/teachers", tags=["teachers"])
app.include_router(attendance.router, prefix=f"/api/{version}/routers/attendance", tags=["attendance"])
app.include_router(students.router, prefix=f"/api/{version}/routers/students", tags=["students"])
app.include_router(exams.router, prefix=f"/api/{version}/routers/exams", tags=["exams"])