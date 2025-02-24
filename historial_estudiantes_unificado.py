import pandas as pd

# Cargar el archivo unificado
ruta_archivo_unificado = r'C:\Users\javie\Documents\Proyecto_Tesis\historial_estudiantes_unificado.xlsx'
df = pd.read_excel(ruta_archivo_unificado)

# Mostrar las primeras filas del archivo para verificar
print(df.head())

# Eliminar filas con valores nulos en columnas clave
df = df.dropna(subset=['1P', '2P', '3P'])

# Llenar valores nulos en otras columnas (si es necesario)
df.fillna(0, inplace=True)

# Seleccionar columnas relevantes para el modelo
columnas_modelo = ['1P', '2P', '3P', 'PROMEDIO_CALCULADO', 'DESVIACION_STD']
X = df[columnas_modelo]

print("Datos listos para predecir:")
print(X.head())
