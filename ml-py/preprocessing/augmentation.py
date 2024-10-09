#pip install albumentations

import albumentations as A
import itertools
import cv2
import os

# Input and output directories
input_dir = '../data/datasets_raw'
output_dir = '../data/datasets_augment'
os.makedirs(output_dir, exist_ok=True)

# Define individual augmentations
augmentations_list = [
    ("horizontal_flip", A.HorizontalFlip(p=1)),
    ("rotate_0_to_15", A.Rotate(limit=(0, 15), p=1)),
    ("rotate_0_to_minus_15", A.Rotate(limit=(-15, 0), p=1)),
    ("brightness_too_dark", A.RandomBrightnessContrast(brightness_limit=(-0.3, 0), p=1)),
    ("brightness_too_bright", A.RandomBrightnessContrast(brightness_limit=(0, 0.3), p=1)),
    ("high_contrast", A.RandomBrightnessContrast(contrast_limit=(0, 0.3), p=1)),
    ("low_contrast", A.RandomBrightnessContrast(contrast_limit=(-0.3, 0), p=1)),
    ("small_water_drops", A.GlassBlur(sigma=0.5, max_delta=2, p=1))
]

# Create all possible combinations of augmentations (256 combinations)
combinations = list(itertools.product([0, 1], repeat=len(augmentations_list)))  # 256 combinations of 8 augmentations

# Function to augment and save images
def augment_and_save(image_path, relative_path):
    # Load the original image
    image = cv2.imread(image_path)

    if image is None:
        print(f"Could not load image {image_path}")
        return

    # Extract the base filename without extension
    original_filename = os.path.splitext(os.path.basename(image_path))[0]

    # Create corresponding subfolder in output directory
    output_subfolder = os.path.join(output_dir, relative_path)
    os.makedirs(output_subfolder, exist_ok=True)

    # Apply each combination of augmentations
    for i, combo in enumerate(combinations):
        augmented_image = image.copy()  # Start with the original image

        # Apply selected augmentations
        for idx, apply_aug in enumerate(combo):
            if apply_aug:  # If 1, apply the corresponding augmentation
                augmentation = augmentations_list[idx][1]
                augmented_image = augmentation(image=augmented_image)['image']

        # Save augmented image with unique name (e.g., original_filename_A1.jpg, original_filename_A256.jpg)
        output_path = os.path.join(output_subfolder, f"{original_filename}_A{i+1}.jpg")
        cv2.imwrite(output_path, augmented_image)
        print(f"Saved: {output_path}")

# Traverse through all files in the input directory (including subfolders)
for root, dirs, files in os.walk(input_dir):
    for file in files:
        if file.lower().endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff')):
            # Get the relative path of the current file with respect to the input_dir
            relative_path = os.path.relpath(root, input_dir)
            image_path = os.path.join(root, file)

            # Augment and save images in the corresponding subfolder
            augment_and_save(image_path, relative_path)
