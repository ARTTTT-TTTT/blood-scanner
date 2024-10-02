from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from bson import ObjectId

from .bloodModel import BloodModel

class UserCreateModel(BaseModel):
    email: EmailStr
    username: str
    password: str

class ReadUserProfileModel(BaseModel):
    username: str
    blood: Optional[List[BloodModel]]
    class Config:
        #arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        json_schema_extra = {
            "example": {
                "username": "johndoe",
            }
        }

class UserModel(BaseModel):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    email: EmailStr
    username: str
    password: str
    role: str = "user"
    blood: Optional[List[BloodModel]] = []
    class Config:
        json_encoders = {ObjectId: str}
        json_schema_extra = {
            "example": {
                "email": "john.doe@example.com",
                "username": "johndoe",
                "password": "hashed_password",
                "role": "user",
                "blood": [
                    {
                        "green": 0,
                        "normal": 0,
                        "red": 0,
                        "kun": 0,
                        "total":0
                    }
                ]
            }
        }