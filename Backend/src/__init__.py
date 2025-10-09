from fastapi import FastAPI
from src.db.main import init_db
from contextlib import asynccontextmanager
from src.auth.routes import auth_router 
from .middleware import register_middleware
from src.routers import dashboard, analytics, subjects

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
app.include_router(analytics.router, prefix=f"/api/{version}/routers/subjects", tags=["subjects"])
app.include_router(analytics.router, prefix=f"/api/{version}/routers/schools", tags=["schools"])
