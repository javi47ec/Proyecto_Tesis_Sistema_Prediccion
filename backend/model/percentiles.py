import numpy as np

# Simula que tienes todas las probabilidades predichas hasta ahora
probabilidades = [0.42, 0.43, 0.36, 0.33, 0.42, 0.42, 0.41, 0.42, 0.42, 0.38, 0.42, 0.39, 0.4, 0.41, 0.33, 0.41, 0.37, 0.4, 0.41, 0.4, 0.37]

print("📊 Análisis de probabilidades")
print(f"🔹 Percentil 50 (mediana): {np.percentile(probabilidades, 50):.2f}")
print(f"🔹 Percentil 80: {np.percentile(probabilidades, 80):.2f}")
print(f"🔹 Percentil 90: {np.percentile(probabilidades, 90):.2f}")
print(f"🔹 Máximo valor: {max(probabilidades):.2f}")
