import joblib
import os
import pandas as pd
import numpy as np
from typing import Dict, Any
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)

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

    loan_to_income_ratio = loan_amount / income_annum if income_annum != 0 else np.inf
    emi = loan_amount / (loan_term * 12) if loan_term != 0 else np.inf
    
    if total_assets == 0:
        loan_to_assets_ratio = 10.0
    else:
        loan_to_assets_ratio = loan_amount / total_assets
    
    balance_income = income_annum - (emi * 12)

    return {
        'loan_to_income_ratio': loan_to_income_ratio,
        'emi': emi,
        'loan_to_assets_ratio': loan_to_assets_ratio,
        'balance_income': balance_income
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
    app.logger.info("Received a request")
    data = request.json
    app.logger.info(f"Received data: {data}")
    
    try:
        result = predict_loan_eligibility(data)
        derived_features = calculate_derived_features(data)
        app.logger.info(f"Derived features: {derived_features}")
        app.logger.info(f"Prediction result: {result}")
        return jsonify({"eligible": result})
    except Exception as e:
        app.logger.error(f"Error in prediction: {str(e)}")
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))
    app.run(host='0.0.0.0', port=port, debug=False)