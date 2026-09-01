from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import SignupRequest, LoginRequest, UserUpdateRequest
from auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup")
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered."
        )
    
    # Check if passwords match
    if payload.password != payload.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match."
        )

    # Hash the password and save
    hashed = hash_password(payload.password)
    new_user = User(
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email.lower(),
        password_hash=hashed
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "email": new_user.email
    }

@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    # Check user existence
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email or password."
        )
    
    # Verify password
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email or password."
        )
    
    # Generate token
    token = create_access_token(user.id)
    
    # Return token and user response
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email
        }
    }

@router.get("/me")
def get_me(user: User = Depends(get_current_user)):
    """Retrieves current user's profile details."""
    return {
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "created_at": user.created_at
    }

@router.put("/me")
def update_me(payload: UserUpdateRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Updates current user's profile info and optional password."""
    # Check if new email is already taken by someone else
    if payload.email.lower() != user.email.lower():
        existing = db.query(User).filter(User.email == payload.email.lower()).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use by another account."
            )

    # Password change check
    if payload.password:
        if payload.password != payload.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match."
            )
        user.password_hash = hash_password(payload.password)

    user.first_name = payload.first_name
    user.last_name = payload.last_name
    user.email = payload.email.lower()

    db.commit()
    db.refresh(user)

    return {
        "message": "Profile updated successfully",
        "user": {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email
        }
    }

