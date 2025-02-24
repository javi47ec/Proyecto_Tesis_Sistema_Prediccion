import pandas as pd

def transformar_datos(datos_limpios_path, nivel_interes):
    # Cargar datos
    df = pd.read_excel(datos_limpios_path)

    # Filtrar datos por nivel de interés (por ejemplo, Primer Nivel)
    df_nivel = df[df['NIVEL REFERENCIAL'] == nivel_interes]

    # Agrupar los datos por ID de estudiante y calcular las métricas necesarias
    df_agrupado = df_nivel.groupby('ID').agg({
        'PROMEDIO': 'mean',  # Promedio de las calificaciones
        '1P': 'sum',  # Número de aprobaciones en el primer parcial
        '2P': 'sum',  # Número de aprobaciones en el segundo parcial
        '3P': 'sum',  # Número de aprobaciones en el tercer parcial
        '1P+2P': 'sum',  # Número de aprobaciones en 1P+2P
    }).reset_index()

    # Calcular la desviación estándar de las calificaciones
    df_agrupado['STD'] = df_nivel.groupby('ID')['PROMEDIO'].std().reset_index(drop=True)

    # Verificar si la columna COMENTARIO contiene 'Retirado' o alguna palabra clave de deserción
    df_agrupado['RETIRADOS'] = df_nivel.groupby('ID')['COMENTARIO'].apply(lambda x: x.str.contains('Retirado|Deserción', case=False, na=False).sum()).reset_index(drop=True)

    # Calcular aprobaciones y reprobaciones por semestre (adaptar según tu estructura de datos)
    for i in range(1, 9):
        df_agrupado[f'APRO_N{i}'] = df_nivel.groupby('ID')[f'APRO_N{i}'].sum().reset_index(drop=True)
        df_agrupado[f'PERD_N{i}'] = df_nivel.groupby('ID')[f'PERD_N{i}'].sum().reset_index(drop=True)

    # Aplicar umbral para estudiantes en riesgo (ejemplo: 70%)
    df_agrupado['RIESGO'] = df_agrupado['PROMEDIO'].apply(lambda x: 1 if x < 70 else 0)

    return df_agrupado

# Llamada a la función
datos_transformados = transformar_datos('datos_limpios.xlsx', 'Primer Nivel')

# Guardar el dataset procesado
datos_transformados.to_csv('datos_transformados.csv', index=False)
