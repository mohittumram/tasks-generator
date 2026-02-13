from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import init_db
from .routes import tasks, health
import os

app = FastAPI(title="Tasks Generator API", version="1.0.0")

# CORS configuration
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url, "http://localhost:5173"],
    allow_origin_regex=r"https://.*\.vercel\.app",  # any Vercel deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
init_db()

# Include routers
app.include_router(tasks.router, prefix="/api", tags=["tasks"])
app.include_router(health.router, prefix="/api", tags=["health"])


@app.get("/")
async def root():
    return {"message": "Tasks Generator API", "status": "running"}
