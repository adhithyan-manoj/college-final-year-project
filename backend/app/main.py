from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import (
    schemes,
    profile,
    recommendations,
    eligibility,
    questions,
    ai,
    saved_schemes,
    admin
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Government Scheme and Scholarship Discovery Platform for Indian Citizens",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(schemes.router)
app.include_router(profile.router)
app.include_router(recommendations.router)
app.include_router(eligibility.router)
app.include_router(questions.router)
app.include_router(ai.router)
app.include_router(saved_schemes.router)
app.include_router(admin.router)

@app.get("/")
def root():
    return {
        "name": settings.PROJECT_NAME,
        "status": "online",
        "description": "SchemeConnect API is running.",
        "docs_url": "/docs"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
