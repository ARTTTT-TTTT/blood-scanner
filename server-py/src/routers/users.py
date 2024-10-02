from fastapi import APIRouter, Depends

from ..models.userModel import ReadUserProfileModel
from ..auth.auth import get_current_user
from ..database import users_collection

router = APIRouter()

@router.get("/profile", response_model=ReadUserProfileModel)
async def read_user_profile(current_user: ReadUserProfileModel = Depends(get_current_user)):
    return current_user
    