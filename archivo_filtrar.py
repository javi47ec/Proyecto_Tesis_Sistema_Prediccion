import pandas as pd
import warnings
import os

# Ignorar advertencias de openpyxl
warnings.filterwarnings("ignore", category=UserWarning, module="openpyxl")

# Ruta del archivo de entrada y salida
archivo_entrada = r"C:\Users\javie\Documents\Proyecto_Tesis\historial\202450.xlsx"  
archivo_salida = r"archivo_filtrado.xlsx" 

# Lista de las cabeceras correctas
cabeceras_correctas = [
    "CODIGO_ASIGNATURA", "ASIGNATURA", "AREA", "CAMPUS_NRC", "NRC", "DOCENTE",
    "ALUMNO", "ID", "CEDULA", "CARRERA", "CAMPUS_CARRERA", "GENERO",
    "NOTAS_PARCIALES", "NOTA_HISTORICO", "COMENTARIO"
]

try:
    # Cargar las primeras filas para determinar dónde están las cabeceras reales
    df_raw = pd.read_excel(archivo_entrada, header=None)
    print("Archivo cargado correctamente.")

    # Mostrar las primeras filas para identificar la fila con las cabeceras reales
    print("Primeras filas del archivo:")
    print(df_raw.head(10))  # Cambia 10 si necesitas más filas para analizar

    # Ajustar manualmente la fila con las cabeceras reales
    fila_cabeceras = 5  # Cambia este número según corresponda (0-indexado)

    # Recargar el archivo con las cabeceras reales
    df = pd.read_excel(archivo_entrada, header=fila_cabeceras)
    print("Columnas originales detectadas:")
    print(df.columns)

    # Filtro: Filtrar por 'SANTO DOMINGO' en las columnas relevantes
    filtro = df[
        (df["CAMPUS_NRC"].str.contains("SANTO DOMINGO", na=False)) |
        (df["CAMPUS_CARRERA"].str.contains("SANTO DOMINGO", na=False))
    ]

    # Reemplazar las cabeceras actuales con las correctas
    filtro.columns = cabeceras_correctas

    # Guardar el resultado filtrado en un nuevo archivo
    filtro.to_excel(archivo_salida, index=False)
    print(f"Archivo filtrado y ajustado guardado en: {archivo_salida}")

except KeyError as e:
    print(f"Error: La columna especificada no existe en el archivo. Detalles: {e}")
except Exception as e:
    print(f"Error procesando el archivo: {e}")
