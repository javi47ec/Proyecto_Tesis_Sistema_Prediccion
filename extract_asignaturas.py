import pandas as pd

# Ruta del archivo Excel
ruta_archivo = r'C:\Users\javie\Downloads\hoja_datos_actualizada202451.xlsx'

# Leer el archivo Excel con el header en la fila correcta (fila 4 que corresponde a index 4)
df = pd.read_excel(ruta_archivo, header=4)

# Imprimir los nombres de las columnas para verificar
print("Nombres de las columnas en el DataFrame:")
print(df.columns)

# Extraer los nombres de las asignaturas sin duplicados
# Asegúrate de que el nombre de la columna sea correcto
columna_asignatura = "ASIGNATURA"  # Cambia esto si el nombre de la columna es diferente
if columna_asignatura in df.columns:
    asignaturas = df[columna_asignatura].dropna().unique()

    # Imprimir los nombres de las asignaturas
    print("\nNombres de las asignaturas:")
    for asignatura in asignaturas:
        print(asignatura)
else:
    print(f"La columna '{columna_asignatura}' no se encuentra en el DataFrame.")
