import pandas as pd
import joblib

from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier

# ============================================
# LOAD DATASET
# ============================================

df = pd.read_csv("dataset2.csv")

print("\nDataset Loaded ✅")
print(df.head())

# ============================================
# ENCODE
# ============================================

encoders = {}

for col in df.columns:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col].astype(str))
    encoders[col] = le

# ============================================
# FEATURES & TARGET
# ============================================

X = df.drop(["target_stream"], axis=1)

y = df["target_stream"]

# ============================================
# TRAIN TEST SPLIT
# ============================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# ============================================
# MODELS
# ============================================

models = {
    "Decision Tree": DecisionTreeClassifier(random_state=42),

    "Random Forest": RandomForestClassifier(
        n_estimators=100,
        random_state=42
    ),

    "Naive Bayes": GaussianNB(),

    "KNN": KNeighborsClassifier(n_neighbors=5)
}

best_model = None
best_model_name = ""
best_accuracy = 0

# ============================================
# TRAIN & EVALUATE
# ============================================

print("\n========== MODEL COMPARISON ==========\n")

for name, model in models.items():

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    accuracy = accuracy_score(y_test, predictions)

    print(f"{name} Accuracy: {accuracy:.4f}")

    print(classification_report(y_test, predictions))

    print("-" * 50)

    if accuracy > best_accuracy:
        best_accuracy = accuracy
        best_model = model
        best_model_name = name

# ============================================
# SAVE BEST MODEL
# ============================================

joblib.dump(best_model, "model_q2.pkl")

joblib.dump(encoders, "encoders_q2.pkl")

joblib.dump(best_model_name, "best_model_q2.pkl")

print("\n======================================")
print(f"Best Model: {best_model_name}")
print(f"Best Accuracy: {best_accuracy:.4f}")
print("Q2 Best Model Saved ✅")
print("======================================")