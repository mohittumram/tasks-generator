from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db, engine
from ..llm_service import LLMService
from sqlalchemy import text

router = APIRouter()


@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint for backend, database, and LLM"""
    health_status = {
        "backend": True,
        "database": False,
        "llm": {"connected": False, "provider": None, "error": None}
    }
    
    # Test database connection
    try:
        db.execute(text("SELECT 1"))
        health_status["database"] = True
    except Exception as e:
        health_status["database"] = False
        health_status["database_error"] = str(e)
    
    # Test LLM connection
    try:
        llm_service = LLMService()
        llm_status = llm_service.test_connection()
        health_status["llm"] = llm_status
    except Exception as e:
        health_status["llm"] = {"connected": False, "error": str(e)}
    
    return health_status
