import pandas as pd # type: ignore
import gender_guesser.detector as gender # type: ignore


def extraer_primer_nombre(nombre_completo):
    """
    Extrae el primer nombre de una cadena en formato 'APELLIDO, NOMBRE'.
    """
    try:
        # Divide por la coma y toma la parte del nombre
        nombre = nombre_completo.split(",")[1].strip()
        # Divide por espacios para obtener el primer nombre
        primer_nombre = nombre.split()[0]
        return primer_nombre.capitalize()  # Normaliza a capitalización estándar
    except IndexError:
        return None  # Si el formato no es válido, retorna None


def determinar_genero(nombre, detector):
    """
    Determina el género basado en el primer nombre.
    """
    if not nombre:
        return "NO DETERMINADO"

    genero = detector.get_gender(nombre)
    if genero in ["male"]:
        return "MASCULINO"
    elif genero in ["female"]:
        return "FEMENINO"
    else:
        return "NO DETERMINADO"



def agregar_genero(archivo_entrada, archivo_salida):
    """
    Lee un archivo Excel, agrega la columna 'GENERO' y guarda un nuevo archivo.
    """
    # Carga los datos
    datos = pd.read_excel(archivo_entrada)
    detector = gender.Detector()

    # Extraer el primer nombre y determinar género
    datos["PRIMER_NOMBRE"] = datos["NOMBRES"].apply(extraer_primer_nombre)
    datos["GENERO"] = datos["PRIMER_NOMBRE"].apply(lambda x: determinar_genero(x, detector))

    # Guardar el archivo modificado
    datos.to_excel(archivo_salida, index=False)
    print(f"Archivo generado con la columna 'GENERO': {archivo_salida}")




# Archivos
archivo_entrada = "datos_limpios.xlsx"
archivo_salida = "historial_con_genero1.xlsx"

# Llamar a la función
agregar_genero(archivo_entrada, archivo_salida)
