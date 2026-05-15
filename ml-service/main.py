from fastapi import FastAPI, HTTPException
import joblib

app = FastAPI()

model_q1 = joblib.load("model_q1.pkl")
encoders_q1 = joblib.load("encoders_q1.pkl")

model_q2 = joblib.load("model_q2.pkl")
encoders_q2 = joblib.load("encoders_q2.pkl")


def normalize_value(value: str) -> str:
    return str(value).strip()


@app.get("/")
def home():
    return {"message": "ML API Running 🚀"}


@app.post("/predict1")
def predict1(data: dict):
    processed = []

    feature_order = [
        "academic_performance",
        "math_level",
        "science_level",
        "english_level",
        "interest_type",
        "study_consistency",
        "problem_solving",
        "focus_time",
        "learning_style",
        "english_comfort",
        "computer_usage",
        "financial_status",
    ]

    for key in feature_order:
        value = normalize_value(data[key])
        encoder = encoders_q1[key]

        if value not in encoder.classes_:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid value '{value}' for field '{key}'. Allowed values: {list(encoder.classes_)}"
            )

        processed.append(encoder.transform([value])[0])

    prediction = model_q1.predict([processed])[0]
    label = encoders_q1["target_stream"].inverse_transform([prediction])[0]

    return {"prediction": label}


@app.post("/predict2")
def predict2(data: dict):
    processed = []

    feature_order = [
        "previous_system",
        "previous_stream",
        "academic_performance",
        "strong_subject",
        "weak_area",
        "interest_area",
        "study_independence",
        "study_hours",
        "analytical_skill",
        "problem_handling",
        "tuition_access",
        "study_preference",
        "career_clarity",
        "decision_factor",
        "confidence_level",
    ]

    for key in feature_order:
        value = normalize_value(data[key])
        encoder = encoders_q2[key]

        if value not in encoder.classes_:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid value '{value}' for field '{key}'. Allowed values: {list(encoder.classes_)}"
            )

        processed.append(encoder.transform([value])[0])

    prediction = model_q2.predict([processed])[0]
    label = encoders_q2["target_stream"].inverse_transform([prediction])[0]

    return {"prediction": label}