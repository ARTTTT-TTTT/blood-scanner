from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import lightgbm as lgb
import pandas as pd

# Load your data
data = pd.read_csv('../preprocessing/hsv_histogram_features.csv')

# Separate features and target labels
X = data.drop(columns=['Label'])  # Features
y = data['Label']  # Target

# Perform an 80:20 train-test split with stratification
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)

# Convert data to LightGBM dataset
train_data = lgb.Dataset(X_train, label=y_train)
test_data = lgb.Dataset(X_test, label=y_test, reference=train_data)

# Define LightGBM parameters (this is just an example, you can adjust as needed)
params = {
    'objective': 'multiclass',
    'num_class': len(y.unique()),  # Number of classes in the dataset
    'metric': 'multi_logloss',
    'boosting_type': 'gbdt',
    'learning_rate': 0.1,
    'num_leaves': 31,
    'max_depth': -1,
    'random_state': 42
}

# Train the LightGBM model with early stopping
model = lgb.train(
    params,
    train_data,
    num_boost_round=100,  # Number of boosting iterations
    valid_sets=[train_data, test_data],
    valid_names=['train', 'test'],
    callbacks=[lgb.early_stopping(stopping_rounds=10)]  # Early stopping callback
)

# Save the trained model
model.save_model('../models/lightgbm_model.txt')
print("Model saved as 'lightgbm_model.txt'.")

# Load the saved model
loaded_model = lgb.Booster(model_file='../models/lightgbm_model.txt')
print("Model loaded successfully.")

# Predict on the test set using the loaded model
y_pred_loaded = loaded_model.predict(X_test, num_iteration=loaded_model.best_iteration)
y_pred_labels_loaded = [list(x).index(max(x)) for x in y_pred_loaded]  # Convert probability to class label

# Evaluate the accuracy of the loaded model
accuracy_loaded = accuracy_score(y_test, y_pred_labels_loaded)
print(f'Accuracy of loaded model: {accuracy_loaded * 100:.2f}%')

# Accuracy of loaded model: 96.38%