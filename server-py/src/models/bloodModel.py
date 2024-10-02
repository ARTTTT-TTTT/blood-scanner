from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class BloodModel(BaseModel):
    date: Optional[date]
    green: Optional[int]
    normal: Optional[int]
    red: Optional[int]
    kun: Optional[int]
    total: Optional[int]
    
    class Config:
        json_schema_extra = {
            "example": {
                "date": "2024-01-01",
                "green": 0,
                "normal": 0,
                "red": 0,
                "kun": 0,
                "total": 0,
            }
        }

class UpdateBloodModel(BaseModel):
    blood: Optional[List[BloodModel]]