import pandas as pd
import numpy as np
from matplotlib import pyplot as plt
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.model_selection import train_test_split
import logging

def procesar_historial(historial_path, output_path='historial_procesado.xlsx'):
    """
    Procesa el historial académico para prepararlo para el modelo predictivo.
    
    Args:
        historial_path (str): Ruta al archivo Excel con datos originales
        output_path (str): Ruta donde se guardará el archivo procesado
    
    Returns:
        pandas.DataFrame: DataFrame procesado
    """
    try:
        df = pd.read_excel(historial_path)
        print(f"Datos cargados: {len(df)} registros")

        # Limpieza previa
        df = df.dropna(subset=['ID'])  # Eliminar registros sin ID
        df = df[df['ID'].astype(str).str.match(r'L\d+')]  # Solo IDs válidos

        # Función para limpiar calificaciones
        def limpiar_calificacion(valor):
            if pd.isna(valor):
                return np.nan
            if isinstance(valor, str):
                if 'APROBADO' in valor.upper():
                    return 14.0  # Nota mínima de aprobación
                valor = valor.replace(',', '.')
                try:
                    return float(valor)
                except:
                    return np.nan
            return float(valor)

        # Limpiar calificaciones
        for col in ['1P', '2P', '3P']:
            df[col] = df[col].apply(limpiar_calificacion)
            
            # Validar rango de calificaciones
            df.loc[df[col] > 20, col] = np.nan
            df.loc[df[col] < 0, col] = np.nan

        # Estadísticas de la limpieza
        print("\nEstadísticas después de limpieza inicial:")
        for col in ['1P', '2P', '3P']:
            validos = df[col].notna().sum()
            total = len(df)
            print(f"{col}: {validos} valores válidos de {total} ({validos/total*100:.1f}%)")

        # Filtrar registros con calificaciones completas
        df_limpio = df[df[['1P', '2P', '3P']].notnull().all(axis=1)].copy()
        
        # Calcular métricas
        df_limpio['PROMEDIO_CALCULADO'] = df_limpio[['1P', '2P', '3P']].mean(axis=1)
        df_limpio['DESVIACION_STD'] = df_limpio[['1P', '2P', '3P']].std(axis=1)

        # Resumen final
        print(f"\nResumen final:")
        print(f"Registros originales: {len(df)}")
        print(f"Registros válidos: {len(df_limpio)}")
        print(f"Registros descartados: {len(df) - len(df_limpio)}")

        # Visualizaciones
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        
        # Promedios
        axes[0,0].hist(df_limpio['PROMEDIO_CALCULADO'], bins=20, edgecolor='black')
        axes[0,0].set_title('Distribución de Promedios')
        axes[0,0].set_xlabel('Promedio')
        axes[0,0].set_ylabel('Frecuencia')

        # Desviación estándar
        axes[0,1].hist(df_limpio['DESVIACION_STD'], bins=20, edgecolor='black')
        axes[0,1].set_title('Distribución de Desviación Estándar')
        axes[0,1].set_xlabel('Desviación Estándar')
        axes[0,1].set_ylabel('Frecuencia')

        # Box plots de calificaciones
        df_limpio.boxplot(column=['1P', '2P', '3P'], ax=axes[1,0])
        axes[1,0].set_title('Distribución de Calificaciones por Parcial')

        # Scatter plot de promedio vs desviación
        axes[1,1].scatter(df_limpio['PROMEDIO_CALCULADO'], df_limpio['DESVIACION_STD'], alpha=0.5)
        axes[1,1].set_title('Promedio vs Desviación Estándar')
        axes[1,1].set_xlabel('Promedio')
        axes[1,1].set_ylabel('Desviación Estándar')

        plt.tight_layout()
        plt.show()

        # Guardar resultados
        df_limpio.to_excel(output_path, index=False)
        print(f"\nDatos procesados guardados en {output_path}")

        return df_limpio

    except Exception as e:
        logging.error(f"Error durante el procesamiento: {str(e)}")
        raise

if __name__ == "__main__":
    try:
        historial_path = 'datos_limpios.xlsx'
        df_procesado = procesar_historial(historial_path)
        
    except Exception as e:
        print(f"Error en el programa principal: {str(e)}")