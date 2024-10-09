import os
import shutil
from pathlib import Path

# Input and output directories
input_dir = '../data/datasets_augment_random'  # Replace with your root input folder
output_dir = 'result2'  # Replace with your output folder
os.makedirs(output_dir, exist_ok=True)

# Maximum number of images to copy from each subfolder
max_images_per_folder = 1000

# File extensions to consider as images
image_extensions = ('.png', '.jpg', '.jpeg', '.bmp', '.tiff')

# Function to copy images from subfolders
def copy_images(input_dir, output_dir, max_images_per_folder):
    # Traverse through all files in the input directory (including subfolders)
    for root, dirs, files in os.walk(input_dir):
        # Filter out image files
        image_files = [file for file in files if file.lower().endswith(image_extensions)]

        # Limit to the first `max_images_per_folder` images in the folder
        selected_images = image_files[:max_images_per_folder]

        # Get the relative path of the current subfolder
        relative_path = os.path.relpath(root, input_dir)

        # Create the corresponding subfolder in the output directory
        destination_subfolder = os.path.join(output_dir, relative_path)
        os.makedirs(destination_subfolder, exist_ok=True)

        # Copy the selected images
        for file in selected_images:
            src_file_path = os.path.join(root, file)
            dst_file_path = os.path.join(destination_subfolder, file)

            shutil.copy2(src_file_path, dst_file_path)
            print(f"Copied: {src_file_path} -> {dst_file_path}")

# Execute the copying process
copy_images(input_dir, output_dir, max_images_per_folder)
