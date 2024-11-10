from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .database import connect_to_mongodb, close_mongodb_connection
from .config import settings
from .routes import illness, user, hospitals, billing
from .services.query_management import process_audio

app = FastAPI(
    title=settings.APP_NAME,
    description=f"{settings.APP_NAME} API",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Event handlers for database connection
@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongodb()
    print(f"Connected to MongoDB at {settings.MONGODB_CONNECTION_STRING}")

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongodb_connection()

# Include the illness router
app.include_router(illness.router, prefix="/api", tags=["Illness"])

# Include the user router
app.include_router(user.router, prefix="/api", tags=["Users"])

# Include the hospitals router
app.include_router(hospitals.router, prefix="/api", tags=["Hospitals"])

# Include the billing router
app.include_router(billing.router, prefix="/api", tags=["Billing"])

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "environment": settings.ENVIRONMENT
    }

@app.post("/api/transcribe")
async def transcribe_audio(audio: UploadFile = File(...)):
    try:
        # Await the read() operation
        audio_data = await audio.read()
        transcription = process_audio(audio_data)
        return {"text": transcription}
    except Exception as e:
        print(f"Error in transcribe_audio: {str(e)}")  # Debug logging
        raise HTTPException(status_code=500, detail=str(e))