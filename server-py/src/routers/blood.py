from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
from datetime import date, timedelta
import lightgbm as lgb
import numpy as np
import cv2
import os

from ..models.bloodModel import UpdateBloodModel
from ..auth.auth import get_current_user
from ..database import users_collection

router = APIRouter()

def process_image(image_path):
    resized_image = cv2.imread(image_path)

    # Center crop to 256x256
    center_x, center_y = resized_image.shape[1] // 2, resized_image.shape[0] // 2
    cropped_image = resized_image[center_y - 128:center_y + 128, center_x - 128:center_x + 128]

    # Convert to HSV color space
    hsv_image = cv2.cvtColor(cropped_image, cv2.COLOR_BGR2HSV)

    # Extract histograms for H, S, and V channels
    h_hist = cv2.calcHist([hsv_image], [0], None, [256], [0, 256]).flatten()
    s_hist = cv2.calcHist([hsv_image], [1], None, [256], [0, 256]).flatten()
    v_hist = cv2.calcHist([hsv_image], [2], None, [256], [0, 256]).flatten()

    # Normalize histograms
    h_hist = h_hist / h_hist.sum()
    s_hist = s_hist / s_hist.sum()
    v_hist = v_hist / v_hist.sum()

    current_dir = os.path.dirname(__file__)
    model_filename = os.path.join(current_dir, "../models/lightgbm_model.txt")                      # Load Model
    loaded_model = lgb.Booster(model_file=model_filename) 

    feature_vector = np.concatenate([h_hist, s_hist, v_hist])
    feature_vector = feature_vector.reshape(1, -1)                                                  # Reshape for LightGBM input
    y_pred_loaded = loaded_model.predict(feature_vector, num_iteration=loaded_model.best_iteration) # Predict using the loaded model
    predicted_label = np.argmax(y_pred_loaded, axis=1)                                              # Convert the predicted probabilities to class label
    folder_labels = {'Normal': 0, 'Kun': 1, 'Red': 2, 'Green': 3}
    reverse_folder_labels = {v: k for k, v in folder_labels.items()}                                # Reverse the dict
    predicted_label_name = reverse_folder_labels[predicted_label[0]] 

    return predicted_label_name

@router.post("/upload-image-prediction/")
async def upload_image_prediction(image: UploadFile = File(...)):
    temp_file_path = f"temp_{image.filename}"
    with open(temp_file_path, "wb") as buffer:
        buffer.write(await image.read())
    try:
        predicted_label_name = process_image(temp_file_path)
        os.remove(temp_file_path)
        return predicted_label_name
    except Exception as e:
        os.remove(temp_file_path)
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

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