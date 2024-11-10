from fastapi import APIRouter, HTTPException
from typing import List
from pydantic import BaseModel
from ..models import Provider
from ..services.query_management import translate_text

router = APIRouter()

class TranscriptionObject(BaseModel):
    text: str
    language: str

@router.post("/translate-providers")
async def translate_providers(transcription: TranscriptionObject, providers: List[Provider]):
    if transcription.language == "en":
        return providers
        
    try:
        translated_providers = []
        for provider in providers:
            translated_provider = Provider(
                id=provider.id,
                name=translate_text(transcription.language, provider.name),
                address=translate_text(transcription.language, provider.address),
                specialty=translate_text(transcription.language, provider.specialty),
                cost_estimate=provider.cost_estimate,
                rating=provider.rating,
                insurance_accepted=provider.insurance_accepted
            )
            translated_providers.append(translated_provider)
            
        return translated_providers
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error translating provider information: {str(e)}"
        ) 