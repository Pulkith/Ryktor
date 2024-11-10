from fastapi import APIRouter, HTTPException, Depends, Body
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from ..models import User, UserCreate, UserResponse
from ..database import get_database
import datetime

router = APIRouter()

@router.post("/users", response_model=User)
async def create_user(
    user: UserCreate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    user_entry = User(
        first_name=user.first_name,
        last_name=user.last_name,
        email=user.email,
        password=user.password,
        zipcode=user.zipcode,
        address=user.address,
        city=user.city,
        state=user.state,
        insurance_type=user.insurance_type,
        created_at=datetime.datetime.utcnow()
    )
    
    result = await db.users.insert_one(user_entry.dict(by_alias=True))
    created_user = await db.users.find_one({"_id": result.inserted_id})
    
    if created_user is None:
        raise HTTPException(status_code=404, detail="User creation failed")
        
    return created_user

@router.get("/users/{user_id}", response_model=User)
async def get_user(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
        
    return user

@router.post("/login", response_model=UserResponse)
async def login_user(
    email: str = Body(...),
    password: str = Body(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")
    
    user = await db.users.find_one({"email": email, "password": password})
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    return UserResponse(**user)