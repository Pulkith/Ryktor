from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from ..database import get_database
from ..models import HospitalResponse, LocationRequest
import pandas as pd
import os
from pathlib import Path
import numpy as np

# Get the absolute path to the project root
BASE_DIR = Path(__file__).resolve().parent.parent

router = APIRouter()

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate the Haversine distance between two points on the earth.
    All arguments are in degrees.
    Returns distance in kilometers.
    """
    try:
        # Convert decimal degrees to radians
        lat1, lon1, lat2, lon2 = map(float, [lat1, lon1, lat2, lon2])
        lat1, lon1, lat2, lon2 = map(np.radians, [lat1, lon1, lat2, lon2])
        
        # Haversine formula
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = np.sin(dlat/2.0)**2 + np.cos(lat1) * np.cos(lat2) * np.sin(dlon/2.0)**2
        c = 2 * np.arcsin(np.sqrt(a))
        km = 6371 * c  # Earth's radius is 6371 km
        
        return km
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating distance: {str(e)}")

@router.post("/nearest", response_model=List[HospitalResponse])
async def get_nearest_hospitals(
    request: LocationRequest,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    try:
        # Read hospital data
        csv_path = os.path.join(BASE_DIR, "services", "projectdata", "hospital_trimmed.csv")
        df = pd.read_csv(csv_path)
        
        # Ensure coordinates are float type
        df['LATITUDE'] = pd.to_numeric(df['LATITUDE'], errors='coerce')
        df['LONGITUDE'] = pd.to_numeric(df['LONGITUDE'], errors='coerce')
        
        # Remove any rows with invalid coordinates
        df = df.dropna(subset=['LATITUDE', 'LONGITUDE'])
        
        # Calculate distances for all hospitals
        df['distance'] = df.apply(
            lambda row: calculate_distance(
                request.center.lat,
                request.center.lng,
                row['LATITUDE'],
                row['LONGITUDE']
            ),
            axis=1
        )

        # Sort by distance and get the requested number of hospitals
        nearest_hospitals = df.nsmallest(request.count, 'distance')
        
        # Convert to response format
        hospitals = []
        for _, row in nearest_hospitals.iterrows():
            hospital = HospitalResponse(
                id=str(row.name),
                name=row['NAME'],
                address=row['ADDRESS'],
                latitude=float(row['LATITUDE']),
                longitude=float(row['LONGITUDE']),
                distance=float(row['distance']),
                type=row['TYPE']
            )
            hospitals.append(hospital)

        return hospitals

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing hospital data: {str(e)}")