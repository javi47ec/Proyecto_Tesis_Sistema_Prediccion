import pandas as pd # type: ignore
import mysql.connector # type: ignore
from mysql.connector import Error # type: ignore
import numpy as np # type: ignore

def limpiar_valor(valor, tipo='texto'):
    """
    Limpia y valida un valor del DataFrame
    tipo puede ser: 'texto', 'numero_entero', 'numero_decimal'
    """
    if pd.isna(valor) or valor == '' or valor is None:
        if tipo == 'texto':
            return 'Sin especificar'
        elif tipo == 'numero_entero':
            return 0
        elif tipo == 'numero_decimal':
            return '0.00'
        return 'Sin especificar'
        
    if isinstance(valor, (int, float)):
        if np.isnan(valor):
            if tipo == 'numero_entero':
                return 0
            elif tipo == 'numero_decimal':
                return '0.00'
            return 'Sin especificar'
        if tipo == 'numero_decimal':
            return f"{float(valor):.2f}"
        return valor
        
    if isinstance(valor, str):
        valor_limpio = valor.strip()
        if not valor_limpio:
            if tipo == 'texto':
                return 'Sin especificar'
            elif tipo == 'numero_entero':
                return 0
            elif tipo == 'numero_decimal':
                return '0.00'
        return valor_limpio
        
    return valor


def validar_creditos(creditos):
    """
    Valida que los créditos sean números enteros positivos
    Retorna 0 si es inválido
    """
    try:
        if pd.isna(creditos) or creditos is None or str(creditos).strip() == '':
            return 0
        
        if isinstance(creditos, str):
            creditos = creditos.strip()
            if not creditos:
                return 0
        
        creditos_int = int(float(str(creditos)))
        return creditos_int if creditos_int >= 0 else 0
    except (ValueError, TypeError):
        return 0

def validar_notas(nota):
    """
    Valida que las notas estén en el rango correcto (0-20)
    Retorna un string formateado con dos decimales, '0.00' si es inválido
    """
    try:
        if pd.isna(nota) or nota is None or str(nota).strip() == '':
            return '0.00'
        
        if isinstance(nota, str):
            nota = nota.replace(',', '.').strip()
            if not nota:
                return '0.00'
        
        nota_float = float(nota)
        if 0 <= nota_float <= 20:
            return f"{nota_float:.2f}"
        return '0.00'
    except (ValueError, TypeError):
        return '0.00'

    
def tomar_promedio_directo(promedio):
    """
    Toma el promedio directamente del Excel, convirtiendo coma en punto.
    Retorna un string con dos decimales, '0.00' si es inválido
    """
    try:
        if pd.isna(promedio) or promedio is None or str(promedio).strip() == '':
            return '0.00'
        
        # Si es número, convertir a string con formato correcto
        if isinstance(promedio, (int, float)):
            if np.isnan(promedio):
                return '0.00'
            return f"{float(promedio):.2f}"
        
        # Si es string, limpiar y formatear
        promedio_str = str(promedio).strip().replace(',', '.')
        if not promedio_str:
            return '0.00'
            
        try:
            promedio_float = float(promedio_str)
            if 0 <= promedio_float <= 20:
                return f"{promedio_float:.2f}"
            return '0.00'
        except ValueError:
            return '0.00'
            
    except (ValueError, TypeError):
        return '0.00'

def conectar_mysql():
    try:
        conexion = mysql.connector.connect(
            host='localhost',
            user='root',
            password='root',
            database='tesis_db'
        )
        return conexion
    except Error as e:
        print(f"Error al conectar a MySQL: {e}")
        
        return None

def insertar_docente(conexion, nombre_docente):
    nombre_docente = limpiar_valor(nombre_docente, 'texto')
    if nombre_docente == 'Sin especificar':
        nombre_docente = 'Docente Sin Asignar'
    
    try:
        nombres_completos = nombre_docente.split()
        if len(nombres_completos) < 2:
            nombres_docente = 'Docente'
            apellidos_docente = 'Sin Asignar'
        else:
            nombres_docente = ' '.join(nombres_completos[:-2]) if len(nombres_completos) > 2 else nombres_completos[0]
            apellidos_docente = ' '.join(nombres_completos[-2:]) if len(nombres_completos) > 2 else nombres_completos[-1]
        
        cursor = conexion.cursor()
        cursor.execute("""
            SELECT id_docente FROM docente 
            WHERE nombres = %s AND apellidos = %s
        """, (nombres_docente, apellidos_docente))
        resultado = cursor.fetchone()
        
        if resultado:
            return resultado[0]
        
        cursor.execute("""
            INSERT INTO docente (nombres, apellidos)
            VALUES (%s, %s)
        """, (nombres_docente, apellidos_docente))
        conexion.commit()
        return cursor.lastrowid
    except Error as e:
        print(f"Error al insertar docente: {e}")
        return None

def insertar_area_conocimiento(conexion, area_conocimiento, departamento):
    area_conocimiento = limpiar_valor(area_conocimiento)
    departamento = limpiar_valor(departamento)
    
    if not area_conocimiento or not departamento:
        print(f"Área de conocimiento o departamento faltante: {area_conocimiento} - {departamento}")
        return None
        
    try:
        partes = area_conocimiento.split()
        if len(partes) < 2:
            print(f"Formato de área de conocimiento inválido: {area_conocimiento}")
            return None
            
        codigo = partes[0]
        nombre = ' '.join(partes[1:])
        
        cursor = conexion.cursor()
        cursor.execute("""
            SELECT id_area_conocimiento FROM area_conocimiento 
            WHERE codigo = %s
        """, (codigo,))
        resultado = cursor.fetchone()
        
        if resultado:
            return resultado[0]
        
        cursor.execute("""
            INSERT INTO area_conocimiento (codigo, nombre, departamento)
            VALUES (%s, %s, %s)
        """, (codigo, nombre, departamento))
        conexion.commit()
        return cursor.lastrowid
    except Error as e:
        print(f"Error al insertar área de conocimiento: {e}")
        return None

def insertar_nivel(conexion, nivel_nombre):
    nivel_nombre = limpiar_valor(nivel_nombre)
    if not nivel_nombre:
        return None
        
    try:
        cursor = conexion.cursor()
        cursor.execute("""
            SELECT nivel_id FROM nivel 
            WHERE nombre = %s
        """, (nivel_nombre,))
        resultado = cursor.fetchone()
        
        if resultado:
            return resultado[0]
        
        cursor.execute("""
            INSERT INTO nivel (nombre, descripcion)
            VALUES (%s, %s)
        """, (nivel_nombre, f"Nivel {nivel_nombre}"))
        conexion.commit()
        return cursor.lastrowid
    except Error as e:
        print(f"Error al insertar nivel: {e}")
        print(f"Error al insertar: {e}")
        print(f"Consulta fallida: {cursor.statement}")
        return None

def insertar_estudiante(conexion, datos):
    id_estudiante = limpiar_valor(datos.get('ID'))
    cedula = limpiar_valor(datos.get('CÉDULA'))
    nombres_completos = limpiar_valor(datos.get('NOMBRES'))
    genero = limpiar_valor(datos.get('GENERO'))
    
    if not id_estudiante or not cedula or not nombres_completos or not genero:
        print(f"Datos de estudiante incompletos: ID={id_estudiante}, cédula={cedula}")
        return None
        
    try:
        cursor = conexion.cursor()
        cursor.execute("""
            SELECT id_estudiante FROM estudiante 
            WHERE cedula = %s
        """, (cedula,))
        resultado = cursor.fetchone()
        
        if resultado:
            return resultado[0]
        
        partes = nombres_completos.split(',')
        apellidos = partes[0].strip()
        nombres = partes[1].strip() if len(partes) > 1 else ''
        
        cursor.execute("""
            INSERT INTO estudiante (id_estudiante, cedula, nombres, apellidos, genero)
            VALUES (%s, %s, %s, %s, %s)
        """, (
            id_estudiante,
            cedula,
            nombres,
            apellidos,
            genero
        ))
        conexion.commit()
        return id_estudiante
    except Error as e:
        print(f"Error al insertar estudiante: {e}")
        return None

def insertar_asignatura(conexion, datos):
    nrc = limpiar_valor(datos.get('NRC'), 'texto')
    nombre = limpiar_valor(datos.get('ASIGNATURA'), 'texto')
    creditos = validar_creditos(datos.get('CRED'))
    componentes = limpiar_valor(datos.get('COMPONENTES'), 'texto')
    
    if nrc == 'Sin especificar' or nombre == 'Sin especificar':
        print(f"Datos de asignatura incompletos: NRC={nrc}, nombre={nombre}")
        return None
    
    try:
        cursor = conexion.cursor()
        cursor.execute("""
            SELECT codigo_asignatura FROM asignatura 
            WHERE nrc = %s
        """, (nrc,))
        resultado = cursor.fetchone()
        
        if resultado:
            return resultado[0]
        
        codigo_asignatura = f"ASG{nrc}"
        cursor.execute("""
            INSERT INTO asignatura (
                codigo_asignatura, id_area_conocimiento, nivel_id,
                nombre, nrc, creditos, componentes, camp
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            codigo_asignatura,
            datos.get('id_area_conocimiento'),
            datos.get('nivel_id'),
            nombre,
            nrc,
            creditos,
            componentes,
            limpiar_valor(datos.get('CAMP'), 'texto')
        ))
        conexion.commit()
        return codigo_asignatura
    except Error as e:
        print(f"Error al insertar asignatura: {e}")
        return None

def importar_excel_a_mysql(archivo_excel):
    try:
        print("\nIniciando importación del archivo Excel...")
        df = pd.read_excel(archivo_excel)
        print(f"Archivo Excel leído exitosamente. Filas encontradas: {len(df)}")
        df = df.replace({pd.NA: None, '': None})

        conexion = conectar_mysql()
        if not conexion:
            print("Error: No se pudo establecer la conexión con MySQL")
            return
        print("Conexión a MySQL establecida exitosamente")

        for indice, fila in df.iterrows():
            try:
                print(f"\nProcesando fila {indice + 1}...")

                # Insertar docente
                print(f"Insertando docente: {fila['DOCENTE']}")
                id_docente = insertar_docente(conexion, fila['DOCENTE'])
                if id_docente is None:
                    print(f"Error al insertar docente en fila {indice + 1}")
                    continue

                # Insertar área de conocimiento
                print(f"Insertando área: {fila['AREA DE CONOCIMIENTO']}")
                id_area = insertar_area_conocimiento(conexion, fila['AREA DE CONOCIMIENTO'], fila['DEP'])
                if id_area is None:
                    print(f"Error al insertar área en fila {indice + 1}")
                    continue

                # Insertar estudiante
                print(f"Insertando estudiante: {fila['ID']}")
                id_estudiante = insertar_estudiante(conexion, {
                    'ID': fila['ID'],
                    'CÉDULA': fila['CÉDULA'],
                    'NOMBRES': fila['NOMBRES'],
                    'GENERO': fila.get('GENERO', 'Sin especificar')
                })
                if id_estudiante is None:
                    print(f"Error al insertar estudiante en fila {indice + 1}")
                    continue

                conexion.commit()
                print(f"Fila {indice + 1} procesada correctamente.")
            except Exception as e:
                print(f"Error al procesar fila {indice + 1}: {e}")
    except Exception as e:
        print(f"Error al importar archivo Excel: {e}")



if __name__ == "__main__":
    archivo_excel = "historial_con_genero1.xlsx" 
    importar_excel_a_mysql(archivo_excel)