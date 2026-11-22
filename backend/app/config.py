import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "SchemeConnect"
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "https://xkwpjxxjaczxtvbzfgry.supabase.co")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhrd3BqeHhqYWN6eHR2YnpmZ3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUzMTkwMzEsImV4cCI6MjExMDg5NTAzMX0.zcJabxq91SuV4prOg7tuB2CvUhYO2WFSQqtKFk581Ao")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    ADMIN_SECRET: str = os.getenv("ADMIN_SECRET", "schemeconnect-admin-secure-2026")
    DEFAULT_STATE: str = "Kerala"
    CORS_ORIGINS: list[str] = ["*"]

settings = Settings()
