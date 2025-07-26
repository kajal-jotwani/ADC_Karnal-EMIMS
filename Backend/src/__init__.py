from fastapi import FastAPI
from src.db.main import init_db
from contextlib import asynccontextmanager

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