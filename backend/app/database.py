from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from .config import settings

class Database:
    client: AsyncIOMotorClient = None
    db: AsyncIOMotorDatabase = None

db = Database()

async def get_database() -> AsyncIOMotorDatabase:
    if db.db is None:
        db.db = db.client[settings.DATABASE_NAME]
    return db.db

async def connect_to_mongodb():
    db.client = AsyncIOMotorClient(settings.MONGODB_CONNECTION_STRING)
    db.db = db.client[settings.DATABASE_NAME]

async def close_mongodb_connection():
    if db.client:
        db.client.close() 