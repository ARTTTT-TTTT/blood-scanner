import lightgbm as lgb
import numpy as np
import cv2

# Function to resize, center crop, and extract HSV histogram
def process_image(image_path):
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
image_path = './data/datasets_raw/G/53239_0_crop.jpg'
folder_labels = {'Normal': 0, 'Kun': 1, 'Red': 2, 'Green': 3}

feature_vector = process_image(image_path)

# Load the pre-trained LightGBM model
loaded_model = lgb.Booster(model_file='./models/lightgbm_model.txt')

# Prepare the feature vector for prediction
feature_vector = feature_vector.reshape(1, -1)  # Reshape for LightGBM input

# Predict using the loaded model
y_pred_loaded = loaded_model.predict(feature_vector, num_iteration=loaded_model.best_iteration)

# Convert the predicted probabilities to class label
predicted_label = np.argmax(y_pred_loaded, axis=1)  # Get the index of the max probability

# Reverse the folder label mapping to get the label from the numeric prediction
reverse_folder_labels = {v: k for k, v in folder_labels.items()}  # Reverse the dict

# Get the predicted label name
predicted_label_name = reverse_folder_labels[predicted_label[0]]

# Output the predicted label
print(f'Predicted label: {predicted_label_name}')
