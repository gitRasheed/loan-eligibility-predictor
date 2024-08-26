import joblib
import os
import pandas as pd
from typing import Dict, Any
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load the model and scaler only once when the script is imported
current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, '..', 'models', 'loan_eligibility_model.joblib')
scaler_path = os.path.join(current_dir, '..', 'models', 'feature_scaler.joblib')

model = joblib.load(model_path)
scaler = joblib.load(scaler_path)

def calculate_derived_features(data: Dict[str, Any]) -> Dict[str, float]:
    loan_amount = data['loan_amount']
    income_annum = data['income_annum']
    loan_term = data['loan_term']
    total_assets = data['total_assets']

    return {
        'loan_to_income_ratio': loan_amount / income_annum if income_annum != 0 else 0,
        'emi': loan_amount / (loan_term * 12) if loan_term != 0 else 0,
        'loan_to_assets_ratio': loan_amount / total_assets if total_assets != 0 else 0,
        'balance_income': income_annum - (loan_amount / (loan_term * 12) if loan_term != 0 else 0) * 12
    }

def predict_loan_eligibility(data: Dict[str, Any]) -> bool:
    derived_features = calculate_derived_features(data)

    features = pd.DataFrame({
        'loan_term': [data['loan_term']],
        'cibil_score': [data['cibil_score']],
        'loan_to_income_ratio': [derived_features['loan_to_income_ratio']],
        'emi': [derived_features['emi']],
        'loan_to_assets_ratio': [derived_features['loan_to_assets_ratio']],
        'balance_income': [derived_features['balance_income']]
    })

    scaled_features = scaler.transform(features)
    prediction = model.predict(scaled_features)

    return bool(prediction[0])

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    try:
        result = predict_loan_eligibility(data)
        return jsonify({"eligible": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))