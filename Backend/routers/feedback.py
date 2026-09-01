from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel, Field
from jose import jwt

from database import get_db
from models import Feedback
from auth import security, SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/feedback", tags=["Feedback"])


class FeedbackCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    category: str = Field(...)
    comments: Optional[str] = None


@router.post("")
def submit_feedback(
    payload: FeedbackCreate,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
):
    user_id = None
    if credentials:
        try:
            token = credentials.credentials
            token_payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            uid = token_payload.get("sub")
            if uid:
                user_id = int(uid)
        except Exception:
            pass  # Fall back to anonymous guest feedback

    feedback = Feedback(
        user_id=user_id,
        rating=payload.rating,
        category=payload.category,
        comments=payload.comments
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    return {
        "status": "success",
        "message": "Feedback submitted successfully",
        "feedback_id": feedback.id
    }
