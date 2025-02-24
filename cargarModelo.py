import sys
import json
import joblib
import numpy as np
import pandas as pd
import os
import traceback

# Configurar salida de error para logs
def log_error(message):
    print(message, file=sys.stderr, flush=True)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'modelo_desercion.pkl')
SCALER_PATH = os.path.join(BASE_DIR, 'scaler_desercion.pkl')
UMBRAL_PATH = os.path.join(BASE_DIR, 'umbral.json')  # Archivo para almacenar umbrales dinámicos

FEATURE_NAMES = ['PROMEDIO', 'STD']
for i in range(1, 9):
    FEATURE_NAMES.append(f'APRO_N{i}')
    FEATURE_NAMES.append(f'PERD_N{i}')

def cargar_umbral():
    """ Carga el umbral dinámico desde un archivo JSON o usa valores predeterminados. """
    if os.path.exists(UMBRAL_PATH):
        try:
            with open(UMBRAL_PATH, 'r') as file:
                data = json.load(file)
                return data.get("medio", 0.4), data.get("alto", 0.5)
        except:
            log_error("Error al cargar umbrales. Usando valores por defecto.")
    return 0.4, 0.5  # Ajuste para asegurar coherencia con el frontend


def guardar_umbral(probabilidades):
    """ Calcula y guarda umbrales dinámicos basados en las predicciones reales """
    if len(probabilidades) < 5:
        return  # No actualizar si hay pocos datos

    nuevo_umbral_medio = np.percentile(probabilidades, 50)  # Mediana
    nuevo_umbral_alto = np.percentile(probabilidades, 70)  # Percentil 80

    umbral_data = {"medio": float(nuevo_umbral_medio), "alto": float(nuevo_umbral_alto)}
    with open(UMBRAL_PATH, 'w') as file:
        json.dump(umbral_data, file)
    
    log_error(f"🔄 Nuevo umbral calculado: MEDIO={nuevo_umbral_medio:.2f}, ALTO={nuevo_umbral_alto:.2f}")

try:
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Modelo no encontrado: {MODEL_PATH}")
    if not os.path.exists(SCALER_PATH):
        raise FileNotFoundError(f"Escalador no encontrado: {SCALER_PATH}")

    modelo = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)

    # Leer la entrada estándar desde Node.js
    input_json = sys.stdin.read().strip()
    if not input_json:
        raise ValueError('No se recibió ningún JSON válido desde Node.js')
    
    log_error(f"JSON recibido: {input_json}")

    try:
        input_data = json.loads(input_json)['data']
    except json.JSONDecodeError as e:
        raise ValueError(f"Error al decodificar JSON: {str(e)}")
    
    if not isinstance(input_data, list) or len(input_data) == 0:
        raise ValueError('Error: La entrada de datos no es una lista válida.')

    # Convertir a DataFrame con nombres de características
    datos = pd.DataFrame([input_data], columns=FEATURE_NAMES)
    log_error(f" Datos originales: {datos.values.tolist()}")

    print(" Datos antes del escalado:", datos.values.tolist(), flush=True)

    # Escalar los datos
    datos.columns = FEATURE_NAMES
    datos_escalados_array = scaler.transform(datos)
    datos_escalados = pd.DataFrame(datos_escalados_array, columns=FEATURE_NAMES)
    
    print(" Datos después del escalado:", datos_escalados_array.tolist(), flush=True)
    log_error(f" Datos escalados: {datos_escalados.to_string()}")

    # Realizar predicción
    probabilidad = modelo.predict_proba(datos)[0, 1]
    log_error(f" Probabilidad calculada: {probabilidad:.4f}")

    # Obtener umbrales dinámicos
    umbral_medio, umbral_alto = cargar_umbral()
    log_error(f"Umbrales actuales -> MEDIO: {umbral_medio:.2f}, ALTO: {umbral_alto:.2f}")

    # Determinar nivel de riesgo basado en umbrales dinámicos
    if probabilidad >= umbral_alto:
        nivel_riesgo = "ALTO"
    elif probabilidad >= umbral_medio:
        nivel_riesgo = "MEDIO"
    else:
        nivel_riesgo = "BAJO"

    resultado = {'probabilidad': float(probabilidad), 'nivelRiesgo': nivel_riesgo}

    # Guardar probabilidad para ajuste dinámico
    guardar_umbral([probabilidad])

    print(json.dumps(resultado))

except Exception as e:
    error_message = traceback.format_exc()
    log_error(f"ERROR DETECTADO:\n{error_message}")
    print(json.dumps({'error': str(e)}))
    sys.exit(1)
