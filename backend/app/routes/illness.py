from fastapi import APIRouter, Form, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import List
from ..models import IllnessEntry, IllnessCreate, Provider
from ..database import get_database
from ..services.query_management import detect_text
import datetime
import pandas as pd
import numpy as np
import os
from pathlib import Path

from ..services.query_management import detect_text
from ..services.query import query_pipeline

# Get the absolute path to the project root
BASE_DIR = Path(__file__).resolve().parent.parent

router = APIRouter()

@router.post('/illness/question')
async def get_illness_from_question(prompt: str = Form(...), 
                                    user_id: str = Form(...),
                                    long: float = Form(...),
                                    lat: float = Form(...),
                                    db: AsyncIOMotorDatabase = Depends(get_database),
                                    ):
    print("Processing question...")
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID is required")
    
    # Get user information
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    # convert to correct language
    print("Detecting Language...")
    query = detect_text(prompt)

    user_profile = """Patient has a history of concussions, and is 32, Male. Grown up in Texas, currently living in Princeton, NJ, woring as a software engineer at Blockstone. 
    He is in overall good health. Is 6 foot 1 inches, and 152 pounds. Patient has headaches about once a year.
    """

    user_plan = """OA Managed Choice POS HDHP"""

    docs = ["Patient came in last year for a headache, prescribed OTC drugs and he was good", "Patient came in for a routine-checkup no issues"]

    user_loc = (long, lat)

    print("Beginning Query...")
    response = query_pipeline(query, user_profile, user_plan, docs, user_loc)
    print("Finalized Query...")
    return response




@router.post("/illness", response_model=IllnessEntry)
async def create_illness_entry(
    illness: IllnessCreate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    #make sure the id is valid and the user exists
    try:
        user = await db.users.find_one({"_id": ObjectId(illness.user_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Use process_query to predict illness from symptoms
    treatments_list = process_query([], illness.symptoms)
    predicted_illness = treatments_list[0]["treatment"]
    
    illness_entry = IllnessEntry(
        user_id=illness.user_id,
        symptoms=illness.symptoms,
        predicted_illness=predicted_illness,
        providers=[],
        created_at=datetime.datetime.utcnow()
    )
    
    result = await db.illness_entries.insert_one(illness_entry.dict(by_alias=True))
    created_illness = await db.illness_entries.find_one({"_id": result.inserted_id})
    
    return created_illness

@router.get("/illness/{illness_id}/providers", response_model=List[Provider])
async def get_ranked_providers(
    illness_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Handle invalid input
    try:
        illness = await db.illness_entries.find_one({"_id": ObjectId(illness_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid illness ID")
    
    if not illness:
        raise HTTPException(status_code=404, detail="Illness entry not found")

    # Get user info for location
    try:
        user = await db.users.find_one({"_id": ObjectId(illness["user_id"])})
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID in illness entry")
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Read hospital data
    try:
        csv_path = os.path.join(BASE_DIR, "services", "projectdata", "hospital_trimmed.csv")
        df = pd.read_csv(csv_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading provider data: {str(e)}")

    # Calculate distances using zipcode
    # For now, we'll just take the first 50 providers as a placeholder
    # In a real implementation, you'd want to use geopy or similar to calculate actual distances
    closest_providers = df.head(50)

    # Convert to Provider objects
    providers = []
    for _, row in closest_providers.iterrows():
        cost_estimate = float(np.random.uniform(1000, 5000))
        
        provider_data = {
            "_id": ObjectId(),
            "name": row['NAME'],
            "address": row['ADDRESS'],
            "specialty": row['TYPE'],
            "cost_estimate": cost_estimate,
            "rating": float(np.random.uniform(3.0, 5.0)),
            "insurance_accepted": ["Medicare", "Medicaid"]
        }
        provider = Provider(**provider_data)
        providers.append(provider)

    return providers

@router.get("/illness/user/{user_id}", response_model=List[IllnessEntry])
async def get_user_illnesses(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    # Validate user ID format
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Fetch all illness entries for the user
    cursor = db.illness_entries.find({"user_id": user_id})
    illness_entries = await cursor.to_list(length=None)
    
    if not illness_entries:
        return []
        
    return illness_entries