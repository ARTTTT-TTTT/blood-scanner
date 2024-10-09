import cv2
import os
import numpy as np
import pandas as pd
from tqdm import tqdm

# Function to resize, center crop, and extract HSV histogram
def display_histograms():
    # Example usage
    image_path = '../data/datasets_augment_random/R/53239_0_crop.jpg'

    # Load the image
    image = cv2.imread(image_path)
    # Resize the image to 512x512
    resized_image = cv2.resize(image, (512, 512))

    # Center crop to 256x256
    center_x, center_y = resized_image.shape[1] // 2, resized_image.shape[0] // 2
    cropped_image = resized_image[center_y - 128:center_y + 128, center_x - 128:center_x + 128]

    # Convert to HSV color space
    hsv_image = cv2.cvtColor(cropped_image, cv2.COLOR_BGR2HSV)

    # Extract histograms for H, S, and V channels
    h_hist = cv2.calcHist([hsv_image], [0], None, [256], [0, 256])
    s_hist = cv2.calcHist([hsv_image], [1], None, [256], [0, 256])
    v_hist = cv2.calcHist([hsv_image], [2], None, [256], [0, 256])

    # Normalize histograms
    h_hist = h_hist / h_hist.sum()
    s_hist = s_hist / s_hist.sum()
    v_hist = v_hist / v_hist.sum()
    h_hist, s_hist, v_hist, cropped_image = process_image(image_path)
    display_histograms(h_hist, s_hist, v_hist, cropped_image)

    return display_histograms(h_hist, s_hist, v_hist, cropped_image)

# Function to resize, center crop, and extract HSV histogram
def process_image(image_path):
    # Load the image
    image = cv2.imread(image_path)

    # Resize the image to 512x512
    resized_image = cv2.resize(image, (512, 512))

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

    # Concatenate all features into a single array
    features = np.concatenate([h_hist, s_hist, v_hist])

    return features

# Function to process images from folders and save to CSV
def process_images_from_folders(base_path, output_csv):
    # Labels for folders
    folder_labels = {'N': 0, 'K': 1, 'R': 2, 'G': 3}

    # List to store image features and labels
    data = []

    # Loop over each folder
    for folder_name, label in folder_labels.items():
        folder_path = os.path.join(base_path, folder_name)

        if os.path.exists(folder_path):
            print(f'Processing folder {folder_name}...')

            # Process each image in the folder
            for image_name in tqdm(os.listdir(folder_path)):
                image_path = os.path.join(folder_path, image_name)

                # Process the image and extract features
                features = process_image(image_path)

                # Append the features and label to the data list
                data.append(np.append(features, label))

    # Convert data to a Pandas DataFrame
    columns = [f'H_{i}' for i in range(256)] + [f'S_{i}' for i in range(256)] + [f'V_{i}' for i in range(256)] + ['Label']
    df = pd.DataFrame(data, columns=columns)

    # Save the DataFrame to CSV
    df.to_csv(output_csv, index=False)
    print(f'Saved histogram features to {output_csv}')

# Example usage
base_path = '../data/datasets_augment_random'  # The base directory containing folders A, B, C, and D
output_csv = 'hsv_histogram_features.csv'  # Output CSV file path
process_images_from_folders(base_path, output_csv)
