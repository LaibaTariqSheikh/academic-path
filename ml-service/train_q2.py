import os
import re
import json
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from sklearn.preprocessing import LabelEncoder, label_binarize
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
    roc_curve,
    auc
)

from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier


# ============================================
# HELPER FUNCTION
# ============================================

def safe_filename(name):
    return re.sub(r"[^A-Za-z0-9_]+", "_", name.replace(" ", "_"))


# ============================================
# LOAD DATASET
# ============================================

df = pd.read_csv("dataset2.csv")

print("\nDataset 2 Loaded Successfully")
print(df.head())


# ============================================
# ENCODE CATEGORICAL DATA
# ============================================

encoders = {}

for col in df.columns:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col].astype(str))
    encoders[col] = le


# ============================================
# FEATURES AND TARGET
# ============================================

X = df.drop(["target_stream"], axis=1)
y = df["target_stream"]

class_names = encoders["target_stream"].classes_
classes = np.unique(y)


# ============================================
# TRAIN TEST SPLIT
# ============================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
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


# ============================================
# RESULT FOLDER
# ============================================

result_folder = "q2_results"
os.makedirs(result_folder, exist_ok=True)


# ============================================
# TRAIN, EVALUATE, AND SAVE RESULTS
# ============================================

results = []
best_model = None
best_model_name = ""
best_accuracy = 0

print("\n========== MODEL COMPARISON: DATASET 2 ==========\n")

for name, model in models.items():

    model.fit(X_train, y_train)
    predictions = model.predict(X_test)

    accuracy = accuracy_score(y_test, predictions)
    precision = precision_score(
        y_test,
        predictions,
        average="weighted",
        zero_division=0
    )
    recall = recall_score(
        y_test,
        predictions,
        average="weighted",
        zero_division=0
    )
    f1 = f1_score(
        y_test,
        predictions,
        average="weighted",
        zero_division=0
    )

    results.append({
        "Algorithm": name,
        "Accuracy": round(accuracy * 100, 2),
        "Precision": round(precision * 100, 2),
        "Recall": round(recall * 100, 2),
        "F1-Score": round(f1 * 100, 2)
    })

    print(f"{name}")
    print(f"Accuracy: {accuracy:.4f}")
    print(
        classification_report(
            y_test,
            predictions,
            target_names=class_names,
            zero_division=0
        )
    )
    print("-" * 60)

    # ============================================
    # SAVE CLASSIFICATION REPORT
    # ============================================

    report_text = classification_report(
        y_test,
        predictions,
        target_names=class_names,
        zero_division=0
    )

    with open(
        os.path.join(
            result_folder,
            f"{safe_filename(name)}_classification_report.txt"
        ),
        "w"
    ) as file:
        file.write(f"{name} Classification Report - Dataset 2\n\n")
        file.write(report_text)


    # ============================================
    # CONFUSION MATRIX
    # ============================================

    cm = confusion_matrix(y_test, predictions)

    plt.figure(figsize=(7,6))
    plt.imshow(cm, interpolation="nearest", cmap="Blues")
    plt.title(f"{name} Confusion Matrix - Dataset 2", fontsize=14)
    plt.colorbar()

    tick_marks = np.arange(len(class_names))

    plt.xticks(
        tick_marks,
        class_names,
        rotation=45,
        ha="right"
    )

    plt.yticks(
        tick_marks,
        class_names
    )

    threshold = cm.max()/2 if cm.max()!=0 else 0

    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            plt.text(
                j,
                i,
                format(cm[i,j],"d"),
                ha="center",
                va="center",
                color="white" if cm[i,j] > threshold else "black",
                fontsize=12
            )

    plt.ylabel("Actual Class")
    plt.xlabel("Predicted Class")
    plt.tight_layout()

    plt.savefig(
        os.path.join(
            result_folder,
            f"{safe_filename(name)}_confusion_matrix.png"
        ),
        dpi=300,
        bbox_inches="tight"
    )

    plt.close()


    # ============================================
    # MULTICLASS ROC CURVE
    # ============================================

    if hasattr(model, "predict_proba"):

        y_score = model.predict_proba(X_test)

        y_test_bin = label_binarize(
            y_test,
            classes=classes
        )

        plt.figure(figsize=(8,6))

        for i in range(len(classes)):

            fpr, tpr, _ = roc_curve(
                y_test_bin[:,i],
                y_score[:,i]
            )

            roc_auc = auc(fpr,tpr)

            plt.plot(
                fpr,
                tpr,
                linewidth=2,
                label=f"{class_names[i]} AUC = {roc_auc:.2f}"
            )

        plt.plot(
            [0,1],
            [0,1],
            linestyle="--",
            linewidth=1.5
        )

        plt.xlabel("False Positive Rate")
        plt.ylabel("True Positive Rate")
        plt.title(f"{name} ROC Curve - Dataset 2")
        plt.legend(loc="lower right", fontsize=9)
        plt.grid(alpha=0.3)
        plt.tight_layout()

        plt.savefig(
            os.path.join(
                result_folder,
                f"{safe_filename(name)}_roc_curve.png"
            ),
            dpi=300,
            bbox_inches="tight"
        )

        plt.close()


    # ============================================
    # BEST MODEL
    # ============================================

    if accuracy > best_accuracy:
        best_accuracy = accuracy
        best_model = model
        best_model_name = name


# ============================================
# SAVE COMPARISON TABLE
# ============================================

results_df = pd.DataFrame(results)

results_df.to_csv(
    os.path.join(
        result_folder,
        "model_comparison_q2.csv"
    ),
    index=False
)

print("\nModel Comparison Results")
print(results_df)


# ============================================
# PERFORMANCE COMPARISON GRAPH
# ============================================

plt.figure(figsize=(9,6))

x = np.arange(len(results_df))
width = 0.2

plt.bar(
    x-1.5*width,
    results_df["Accuracy"],
    width,
    label="Accuracy"
)

plt.bar(
    x-0.5*width,
    results_df["Precision"],
    width,
    label="Precision"
)

plt.bar(
    x+0.5*width,
    results_df["Recall"],
    width,
    label="Recall"
)

plt.bar(
    x+1.5*width,
    results_df["F1-Score"],
    width,
    label="F1-Score"
)

plt.xticks(
    x,
    results_df["Algorithm"],
    rotation=20
)

plt.ylabel("Score (%)")
plt.title("Algorithm Performance Comparison - Dataset 2")
plt.legend()
plt.grid(axis="y", alpha=0.3)
plt.tight_layout()

plt.savefig(
    os.path.join(
        result_folder,
        "algorithm_performance_comparison_q2.png"
    ),
    dpi=300,
    bbox_inches="tight"
)

plt.close()


# ============================================
# SAVE BEST MODEL
# ============================================

joblib.dump(best_model, "model_q2.pkl")
joblib.dump(encoders, "encoders_q2.pkl")
joblib.dump(best_model_name, "best_model_q2.pkl")

with open(
    os.path.join(
        result_folder,
        "best_model_q2.json"
    ),
    "w"
) as file:

    json.dump(
        {
            "Best Model": best_model_name,
            "Best Accuracy": round(best_accuracy*100,2)
        },
        file,
        indent=4
    )

print("\n======================================")
print(f"Best Model : {best_model_name}")
print(f"Best Accuracy : {best_accuracy:.4f}")
print("Dataset 2 Training Completed Successfully")
print("======================================")