from pydantic import BaseModel, Field, GetJsonSchemaHandler
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from pydantic.json_schema import JsonSchemaValue
from typing import Annotated, Any

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, value, handler):
        if not ObjectId.is_valid(value):
            raise ValueError("Invalid ObjectId")
        return ObjectId(value)

    @classmethod
    def __get_pydantic_json_schema__(
        cls,
        _schema: Any,
        _handler: GetJsonSchemaHandler
    ) -> JsonSchemaValue:
        return {"type": "string"}

    def __repr__(self):
        return str(self)

    def __str__(self):
        return str(self)

class Provider(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    name: str
    address: str
    specialty: str
    cost_estimate: float
    rating: Optional[float] = None
    insurance_accepted: List[str]

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True

class IllnessEntry(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    user_id: str
    symptoms: str
    predicted_illness: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    providers: List[Provider] = []

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True

class IllnessCreate(BaseModel):
    symptoms: str
    user_id: str 