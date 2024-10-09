#pip install pycaret

from pycaret.classification import *
import pandas as pd

# Step 2: Load the data
data = pd.read_csv('../preprocessing/hsv_histogram_features.csv')

# Step 3: Set up the PyCaret environment
# 'Label' is the target column for classification
clf_setup = setup(data, target='Label', verbose=False, session_id=123, data_split_stratify=True,fold=5)
best_model = compare_models()

# Light Gradient Boosting Machine
# Accuracy = 0.9554
# AUC      = 0.9958
# Recall   = 0.9554
# Prec.    = 0.9557
# F1       = 0.9554
# Kappa	   = 0.9405
# MCC      = 0.9406