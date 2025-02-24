import pandas as pd
import mysql.connector

# 🔹 1️⃣ Conectar a la base de datos
conexion = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root",
    database="tesis_db"
)
cursor = conexion.cursor()

# 🔹 2️⃣ Cargar el archivo Excel con los datos correctos
df = pd.read_excel("historial_estudiantes_oficial.xlsx")

# 🔹 3️⃣ Asegurar que las columnas sean correctas
df.columns = df.columns.str.strip()

# Verificar que el Excel tenga las columnas correctas
if not {'ID', 'PERIODO', 'NRC', 'PROMEDIO'}.issubset(df.columns):
    raise ValueError("Error: El archivo Excel no contiene las columnas necesarias (ID, PERIODO, NRC, PROMEDIO).")

# 🔹 4️⃣ Filtrar solo los datos del periodo 202450
df = df[df['PERIODO'] == 202450]

print(f"Registros a procesar: {len(df)}")
actualizados = 0
no_encontrados = 0

# 🔹 5️⃣ Actualizar la base de datos con los promedios correctos
for index, row in df.iterrows():
    id_estudiante = row['ID']
    periodo = str(row['PERIODO'])  # Convertir a string ya que en la BD es VARCHAR
    nrc = str(row['NRC'])
    promedio = row['PROMEDIO']

    # Primero obtener el código de asignatura correspondiente al NRC
    query_asignatura = """
        SELECT codigo_asignatura 
        FROM asignatura 
        WHERE nrc = %s
    """
    cursor.execute(query_asignatura, (nrc,))
    resultado = cursor.fetchone()
    
    if resultado is None:
        print(f"❌ No se encontró la asignatura con NRC: {nrc} para estudiante: {id_estudiante}")
        no_encontrados += 1
        continue
    
    codigo_asignatura = resultado[0]
    
    # Ahora sí realizar la actualización
    query_update = """
        UPDATE historial_academico 
        SET promedio = %s 
        WHERE id_estudiante = %s 
        AND periodo = %s 
        AND codigo_asignatura = %s
    """
    
    try:
        cursor.execute(query_update, (promedio, id_estudiante, periodo, codigo_asignatura))
        if cursor.rowcount > 0:
            actualizados += 1
            print(f"✅ Actualizado - Estudiante: {id_estudiante}, Asignatura: {codigo_asignatura}, NRC: {nrc}, Promedio: {promedio}")
    except mysql.connector.Error as err:
        print(f"❌ Error al actualizar - Estudiante: {id_estudiante}, NRC: {nrc}")
        print(f"Error: {err}")

# 🔹 6️⃣ Confirmar cambios y cerrar conexión
conexion.commit()
cursor.close()
conexion.close()

print("\n📊 Resumen del proceso:")
print(f"Total de registros procesados: {len(df)}")
print(f"Registros actualizados exitosamente: {actualizados}")
print(f"Registros no encontrados: {no_encontrados}")