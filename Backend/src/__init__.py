from fastapi import FastAPI
from src.db.main import init_db
from contextlib import asynccontextmanager
from src.auth.routes import auth_router 
from .middleware import register_middleware

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

app.include_router(auth_router, prefix=f"/api/{version}/auth", tags=["auth"])
