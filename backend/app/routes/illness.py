from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import List
from ..models import IllnessEntry, IllnessCreate, Provider
from ..database import get_database
from ..services.query_management import process_query
import datetime

router = APIRouter()

@router.post("/illness", response_model=IllnessEntry)
async def create_illness_entry(
    illness: IllnessCreate,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
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
    #handle invalid input
    try:
        illness = await db.illness_entries.find_one({"_id": ObjectId(illness_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid illness ID")
    
    
    if not illness:
        raise HTTPException(status_code=404, detail="Illness entry not found")
    
    # Here you would implement your provider ranking logic
    # For now, we'll return the providers sorted by cost_estimate
    providers = illness.get("providers", [])
    return sorted(providers, key=lambda x: x["cost_estimate"]) 