from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from typing import List
import os
import tempfile
from ..services.computer_vision import insurance_card_pipeline
from ..database import get_database
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId

router = APIRouter()

@router.post("/insurance/upload")
async def upload_insurance_card(
    front_image: UploadFile = File(...),
    back_image: UploadFile = File(...),
    user_id: str = Form(...),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    print(user_id);
    print(front_image);
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required")
        
    # Get user information
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        full_name = f"{user['first_name']} {user['last_name']}"
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")
        
    # Create temporary files for the uploaded images
    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as front_temp:
        front_temp.write(await front_image.read())
        front_path = front_temp.name
        
    with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as back_temp:
        back_temp.write(await back_image.read())
        back_path = back_temp.name

    try:
        # Process the insurance card images
        result = insurance_card_pipeline(front_path, back_path, full_name)
        return result
    finally:
        # Clean up temporary files
        os.unlink(front_path)
        os.unlink(back_path) 