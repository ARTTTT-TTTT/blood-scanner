from fastapi import APIRouter, HTTPException, status, Depends
from datetime import date, timedelta

from ..models.bloodModel import UpdateBloodModel
from ..auth.auth import get_current_user
from ..database import users_collection

router = APIRouter()

@router.get("/", response_model=list)
async def get_recent_blood_data(current_user: dict = Depends(get_current_user)):
    today = date.today()
    thirty_days_ago = today - timedelta(days=30)

    # Query to find blood records within the last 30 days
    user_data = await users_collection.find_one(
        {"_id": current_user["_id"]},
        {"blood": 1}  # Only fetch the "blood" field
    )
    
    if not user_data or "blood" not in user_data:
        return []

    blood_entries = user_data.get("blood", [])

    # Filter blood entries to include only those within the last 30 days
    recent_blood_data = [
        entry for entry in blood_entries
        if "date" in entry and date.fromisoformat(entry["date"]) >= thirty_days_ago
    ]

    # Sort the blood data by date in descending order (most recent first)
    recent_blood_data.sort(key=lambda x: x["date"], reverse=True)

    return recent_blood_data

@router.put("/", response_model=UpdateBloodModel)
async def update_user_blood(
    blood_data: UpdateBloodModel,
    current_user: dict = Depends(get_current_user)
):
    update_data = {k: v for k, v in blood_data.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No data to update"
        )

    # Check current blood records in the database
    current_blood_data = await users_collection.find_one({"_id": current_user["_id"]}, {"blood": 1})

    # Convert date to string and handle today's date logic
    if update_data.get('blood') and update_data['blood']:
        today_date = date.today().isoformat()
        blood_entries = update_data['blood']

        # Retrieve existing blood entries
        existing_blood_entries = current_blood_data.get("blood", [])

        # Create a set of existing dates for easy lookup
        existing_dates = {blood['date'] for blood in existing_blood_entries if 'date' in blood}

        for entry in blood_entries:
            # Calculate total before updating date
            entry['total'] = (entry.get('green', 0) + entry.get('normal', 0) + 
                              entry.get('red', 0) + entry.get('kun', 0))
            
            entry_date = entry.get('date')  # Access date from the dictionary

            if entry_date and entry_date == today_date:
                entry['date'] = today_date  # Update to today's date if it's today
            elif entry_date and entry_date not in existing_dates:
                # If it’s a new date, we can add the new entry with today’s date
                entry['date'] = today_date  # Use today's date for new entries
            else:
                # Optional: If the date is today but needs updating, you can choose to update it here as well
                entry['date'] = today_date  # Update to today's date if needed

    # Update the user's blood data in the database
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": update_data}
    )
    
    return update_data