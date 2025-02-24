from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api/estudiantes/subir-excel', methods=['POST'])
def subir_excel():
    try:
        data = request.get_json()
        if not data or 'estudiantes' not in data:
            raise ValueError("❌ El archivo es requerido o el formato es incorrecto")
        
        print("📥 Datos recibidos en el backend:", data)
        
        # Procesar los datos aquí...
        # Por ejemplo, podrías hacer predicciones basadas en los datos recibidos
        
        # Simulación de predicciones
        predicciones = []
        for estudiante in data['estudiantes']:
            predicciones.append({
                "id_estudiante": estudiante['id_estudiante'],
                "probabilidad": 0.5,  # Valor simulado
                "nivelRiesgo": "Medio"  # Valor simulado
            })
        
        return jsonify({"predicciones": predicciones}), 200
    except Exception as e:
        print("❌ Error al procesar datos:", str(e))
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)
