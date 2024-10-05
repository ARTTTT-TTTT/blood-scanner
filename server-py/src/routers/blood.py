from fastapi import APIRouter, HTTPException, status, Depends,UploadFile, File
from datetime import date, timedelta
import numpy as np
import os
import lightgbm as lgb
import cv2

from ..models.bloodModel import UpdateBloodModel
from ..auth.auth import get_current_user
from ..database import users_collection


router = APIRouter()

# Function to resize, center crop, and extract HSV histogram
def process_image_1(image_path):
    # Load the image
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

    # Concatenate the histograms to form a single feature vector
    feature_vector = np.concatenate([h_hist, s_hist, v_hist])

    return feature_vector

# Process the image to get the feature vector
#image_path = '/content/image_2024-10-05_001237577.png'
folder_labels = {'Normal': 0, 'Kun': 1, 'Red': 2, 'Green': 3}
print(os.path.exists('lightgbm_model.txt'))

#feature_vector = process_image_1(image_path)

# Load the pre-trained LightGBM model
loaded_model = lgb.Booster(model_file='/Users/natthanichasamanchat/Downloads/Development/Github/Blood-Scanner/server-py/lightgbm_model.txt')

# Prepare the feature vector for prediction
#feature_vector = feature_vector.reshape(1, -1)  # Reshape for LightGBM input

# Predict using the loaded model
#y_pred_loaded = loaded_model.predict(feature_vector, num_iteration=loaded_model.best_iteration)

# Convert the predicted probabilities to class label
#predicted_label = np.argmax(y_pred_loaded, axis=1)  # Get the index of the max probability

# Define folder label mapping

# Reverse the folder label mapping to get the label from the numeric prediction
#reverse_folder_labels = {v: k for k, v in folder_labels.items()}  # Reverse the dict

# Get the predicted label name
#predicted_label_name = reverse_folder_labels[predicted_label[0]]

# Output the predicted label
#print(f'Predicted label: {predicted_label_name}')


@router.post("/upload-image/")
async def upload_image(image: UploadFile = File(...)):
    # Save the uploaded file to a temporary location
    temp_file_path = f"temp_{image.filename}"
    with open(temp_file_path, "wb") as buffer:
        buffer.write(await image.read())
    
    try:
        feature_vector = process_image_1(temp_file_path)
        feature_vector = feature_vector.reshape(1, -1)
        y_pred_loaded = loaded_model.predict(feature_vector, num_iteration=loaded_model.best_iteration)
        predicted_label = np.argmax(y_pred_loaded, axis=1)
        reverse_folder_labels = {v: k for k, v in folder_labels.items()}
        predicted_label_name = reverse_folder_labels[predicted_label[0]]
        # Optionally, delete the temporary file after processing
        os.remove(temp_file_path)

        return {"Predict": predicted_label_name}
    except Exception as e:
        os.remove(temp_file_path)  # Clean up the temp file in case of error
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