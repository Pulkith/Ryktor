from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import connect_to_mongodb, close_mongodb_connection
from .config import settings
from .routes import illness, user

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

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "environment": settings.ENVIRONMENT
    } 