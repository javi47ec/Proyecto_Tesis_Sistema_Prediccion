from flask import Flask, request, jsonify
import joblib
import numpy as np
import pandas as pd
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # 🔥 Permitir peticiones desde cualquier origen
app.config['CORS_HEADERS'] = 'Content-Type'

app = Flask(__name__)

# Cargar el modelo y el escalador UNA SOLA VEZ
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, './model/modelo_desercion.pkl')
SCALER_PATH = os.path.join(BASE_DIR, './model/scaler_desercion.pkl')

modelo = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

FEATURE_NAMES = ['PROMEDIO', 'STD']
for i in range(1, 9):
    FEATURE_NAMES.append(f'APRO_N{i}')
    FEATURE_NAMES.append(f'PERD_N{i}')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json.get("data", [])

    if not isinstance(data, list) or len(data) == 0:
        return jsonify({"error": "Datos de entrada inválidos"}), 400

    try:
        # Convertir a numpy array directamente
        datos = np.array(data)

        # Escalar los datos
        datos_escalados = scaler.transform(datos)

        # Realizar predicción en batch
        probabilidades = modelo.predict_proba(datos_escalados)[:, 1]

        # Asignar niveles de riesgo
        umbral_medio, umbral_alto = 0.4, 0.5
        resultados = [
            {
                "probabilidad": float(prob),
                "nivelRiesgo": "ALTO" if prob >= umbral_alto else "MEDIO" if prob >= umbral_medio else "BAJO"
            }
            for prob in probabilidades
        ]

        return jsonify(resultados)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
