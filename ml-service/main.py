from fastapi import FastAPI, HTTPException
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends
import os

app = FastAPI()

# Add rate limiting and security headers
app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["localhost", "127.0.0.1", "*.yourdomain.com"]
)

security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Validate the Bearer token."""
    token = credentials.credentials
    if not token or token != os.getenv("API_TOKEN"):
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    return token


from pydantic import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    debug: bool = False
    
    database_url: str = "postgresql://user:pass@localhost/dcalytics"
    model_cache_ttl: int = 3600
    max_prediction_days: int = 365
    market_data_api_key: Optional[str] = None
    cors_origins: list = ["http://localhost:3000"]
    class Config:
        env_file = ".env"

settings = Settings()

from sqlalchemy import create_engine, Column, Integer, Float, DateTime, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

class PredictionHistory(Base):
    __tablename__ = "prediction_history"
    id = Column(Integer, primary_key=True, index=True)
    model_type = Column(String, index=True)
    predicted_price = Column(Float)
    actual_price = Column(Float, nullable=True)
    prediction_date = Column(DateTime)
    target_date = Column(DateTime)
    accuracy_score = Column(Float, nullable=True)

from functools import wraps

# General error handler for ML models
def handle_ml_errors(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except ValueError as e:
            logger.error(f"Validation error: {e}")
            raise HTTPException(status_code=400, detail=f"Invalid input: {e}")
        except Exception as e:
            logger.error(f"Unhandled error in ML model: {e}")
            raise HTTPException(status_code=500, detail="Internal server error")
    return wrapper
