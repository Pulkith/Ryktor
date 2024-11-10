from pydantic import BaseModel, Field, GetJsonSchemaHandler, field_serializer
from typing import List, Optional, Dict
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
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    name: str
    address: str
    specialty: str
    cost_estimate: float
    rating: Optional[float] = None
    insurance_accepted: List[str]

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True
        arbitrary_types_allowed = True

    @field_serializer('id')
    def serialize_id(self, id: Optional[PyObjectId], _info):
        return str(id) if id else None

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


class InsuranceCard(BaseModel):
    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    first_name: str
    last_name: str
    date_of_birth: Optional[str] = None
    policy_number: str
    group_number: str
    member_id: str
    insurance_company: str
    insurance_plan: str
    insurance_type: Optional[str] = None
    effective_date: str
    in_network_deductible: float
    out_network_deductible: float
    in_network_out_of_pocket_max: float
    out_network_out_of_pocket_max: float

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True
        arbitrary_types_allowed = True

    @field_serializer('id')
    def serialize_id(self, id: Optional[PyObjectId], _info):
        return str(id) if id else None

class User(BaseModel):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    first_name: str
    last_name: str
    email: str
    password: str
    zipcode: str
    address: str
    city: str
    state: str
    insurance_type: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    insurance_card: Optional[InsuranceCard] = None

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str
    zipcode: str
    address: str
    city: str
    state: str
    insurance_type: str

class UserResponse(BaseModel):
    id: PyObjectId = Field(alias="_id")
    first_name: str
    last_name: str
    email: str
    zipcode: str
    address: str
    city: str
    state: str
    insurance_type: str
    created_at: datetime
    insurance_card: Optional[dict] = None

    class Config:
        json_encoders = {ObjectId: str}
        populate_by_name = True

class LatLng(BaseModel):
    lat: float
    lng: float

class LocationRequest(BaseModel):
    center: LatLng
    count: int
    searchTerm: Optional[str] = None

class HospitalResponse(BaseModel):
    id: str
    name: str
    address: str
    latitude: float
    longitude: float
    distance: float
    type: str

class RepaymentStrategy(BaseModel):
    monthly_payment: float
    total_interest_paid: float
    potential_investment_gains: float
    total_cost: float
    payment_schedule: List[Dict]
    risk_level: str
    recommended: bool
    explanation: str

class RepaymentPlan(BaseModel):
    total_amount: float
    max_timeline_months: int
    debt_interest_rate: float
    savings_interest_rate: float
    monthly_income: float
    monthly_budget: Optional[float] = None
