import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split, RandomizedSearchCV, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, roc_curve, auc
from imblearn.over_sampling import SMOTE
from sklearn.metrics import ConfusionMatrixDisplay
import warnings

warnings.filterwarnings('ignore')

class MLDropoutAnalysis:
    def __init__(self, file_path):
        self.file_path = file_path
        self.df = None
        self.X = None
        self.y = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        self.model = None
        self.best_params = {}
        self.scaler = StandardScaler()

    def load_data(self):
        """Carga y prepara el dataset inicial"""
        self.df = pd.read_excel(self.file_path)
        print(f"Tamaño total del dataset: {self.df.shape}")
        print("\nPrimeras filas del dataset:")
        print(self.df.head())
        return self

    def check_data_quality(self):
        """Verifica la calidad de los datos"""
        print("\nVerificando la calidad de los datos...")
        missing_values = self.df.isnull().sum()
        print("\nValores faltantes por columna:")
        print(missing_values[missing_values > 0])
        
        # Verificar si hay valores inconsistentes en las columnas relevantes
        for col in ['PROMEDIO', 'STD']:
            if not pd.api.types.is_numeric_dtype(self.df[col]):
                print(f"Advertencia: La columna {col} contiene valores no numéricos.")
        
        # Verificar si hay valores fuera de rango en las columnas relevantes
        for col in ['PROMEDIO', 'STD']:
            if (self.df[col] < 0).any() or (self.df[col] > 20).any():
                print(f"Advertencia: La columna {col} contiene valores fuera de rango (0-20).")
        
        print("\nCalidad de los datos verificada.")
        return self

    def prepare_features(self):
        """Prepara las características para el modelo"""
        feature_cols = ['PROMEDIO', 'STD']
        for i in range(1, 9):
            feature_cols.extend([f'APRO_N{i}', f'PERD_N{i}'])
        feature_cols.append('RETIROS')

        self.X = self.df[feature_cols]
        self.y = self.df['STATUS'].map({1: 0, 2: 1})  # Mapear 1->0 (no desertor) y 2->1 (desertor)

        print("\nCaracterísticas seleccionadas:", feature_cols)
        print("\nNúmero total de variables:", len(feature_cols))
        print("\nDistribución de clases original:")
        print(self.y.value_counts(normalize=True))

        # Visualización de la distribución del PROMEDIO antes del escalado
        plt.figure(figsize=(10, 5))
        sns.histplot(self.X['PROMEDIO'], kde=True, bins=20)
        plt.title("Distribución del PROMEDIO antes del escalado")
        plt.show()

        # Escalado de características
        self.X = pd.DataFrame(
            self.scaler.fit_transform(self.X),
            columns=self.X.columns
        )

        # Visualización después del escalado
        plt.figure(figsize=(10, 5))
        sns.histplot(self.X['PROMEDIO'], kde=True, bins=20)
        plt.title("Distribución del PROMEDIO después del escalado")
        plt.show()

        return self

    def split_and_balance(self):
        """División de datos y balance con SMOTE"""
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            self.X, self.y, test_size=0.2, random_state=42, stratify=self.y
        )

        smote = SMOTE(random_state=42, sampling_strategy='auto')
        self.X_train, self.y_train = smote.fit_resample(self.X_train, self.y_train)

        print("\nDistribución de clases después de SMOTE:")
        print(pd.Series(self.y_train).value_counts(normalize=True))
        return self

    def train_model(self):
        """Entrena y compara los modelos RandomForest y SVM"""
        param_grid_rf = {
            'n_estimators': [100, 200, 300],
            'max_depth': [10, 15, 20],
            'min_samples_split': [2, 5, 10],
            'class_weight': ['balanced', {0: 1, 1: 2}, {0: 1, 1: 3}]
        }

        print("\nIniciando búsqueda de mejores parámetros para RandomForest...")
        rf = RandomForestClassifier(random_state=42)
        grid_search_rf = RandomizedSearchCV(rf, param_grid_rf, cv=3, scoring='f1', n_jobs=-1, n_iter=10, random_state=42)
        grid_search_rf.fit(self.X_train, self.y_train)

        self.model = grid_search_rf.best_estimator_
        self.best_params = grid_search_rf.best_params_

        print("\nMejores parámetros encontrados para RandomForest:")
        print(self.best_params)

        y_pred = self.model.predict(self.X_test)
        print("\nReporte de clasificación:")
        print(classification_report(self.y_test, y_pred))

        # Matriz de Confusión
        cm = confusion_matrix(self.y_test, y_pred)
        plt.figure(figsize=(8, 6))
        disp = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=['No Desertor', 'Desertor'])
        disp.plot(cmap='Blues', values_format='d')
        plt.title('Matriz de Confusión')
        plt.show()

        return self

    def cross_validate_model(self):
        """Realiza validación cruzada para evaluar el rendimiento del modelo"""
        print("\nRealizando validación cruzada...")
        scores = cross_val_score(self.model, self.X, self.y, cv=10, scoring='f1')
        print("\nResultados de la validación cruzada (F1-score):")
        print(scores)
        print(f"\nF1-score promedio: {scores.mean():.3f}")
        return self

    def analyze_feature_importance(self):
        """Analiza la importancia de las características del modelo"""
        print("\nAnalizando la importancia de las características...")
        feature_importance = pd.DataFrame({
            'feature': self.X.columns,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print("\nImportancia de las características:")
        print(feature_importance.to_string(index=False))
        return self

    def plot_metrics(self):
        """Genera y guarda gráficas importantes del modelo"""
        
        # 1. Curva ROC
        y_pred_proba = self.model.predict_proba(self.X_test)[:, 1]
        fpr, tpr, _ = roc_curve(self.y_test, y_pred_proba)
        roc_auc = auc(fpr, tpr)
        
        plt.figure(figsize=(10, 6))
        plt.plot(fpr, tpr, color='darkorange', lw=2, 
                label=f'Random Forest (AUC = {roc_auc:.3f})')
        plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
        plt.xlim([0.0, 1.0])
        plt.ylim([0.0, 1.05])
        plt.xlabel('Tasa de Falsos Positivos')
        plt.ylabel('Tasa de Verdaderos Positivos')
        plt.title('Curva ROC - Predicción de Deserción')
        plt.legend(loc="lower right")
        plt.grid(True)
        plt.show()
        plt.close()
        
        # 2. Importancia de características
        feature_importance = pd.DataFrame({
            'feature': self.X.columns,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        plt.figure(figsize=(12, 6))
        plt.bar(range(len(feature_importance)), feature_importance['importance'])
        plt.xticks(range(len(feature_importance)), 
                feature_importance['feature'], rotation=45, ha='right')
        plt.xlabel('Características')
        plt.ylabel('Importancia')
        plt.title('Importancia de Características en el Modelo')
        plt.tight_layout()
        plt.savefig('importancia_caracteristicas.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        # 3. Matriz de Confusión
        y_pred = self.model.predict(self.X_test)
        cm = confusion_matrix(self.y_test, y_pred)
        
        plt.figure(figsize=(8, 6))
        disp = ConfusionMatrixDisplay(confusion_matrix=cm, 
                                    display_labels=['No Desertor', 'Desertor'])
        disp.plot(cmap='Blues', values_format='d')
        plt.title('Matriz de Confusión')
        plt.savefig('matriz_confusion.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        # 4. Distribución de probabilidades predichas
        plt.figure(figsize=(10, 6))
        plt.hist(y_pred_proba, bins=50, edgecolor='black')
        plt.xlabel('Probabilidad de Deserción')
        plt.ylabel('Frecuencia')
        plt.title('Distribución de Probabilidades de Deserción')
        plt.savefig('distribucion_probabilidades.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        print("\nGráficas guardadas:")
        print("- curva_roc.png")
        print("- importancia_caracteristicas.png")
        print("- matriz_confusion.png")
        print("- distribucion_probabilidades.png")

    def generate_report(self):
        """Genera un reporte detallado del rendimiento del modelo"""
        # Obtener predicciones
        y_pred = self.model.predict(self.X_test)
        y_pred_proba = self.model.predict_proba(self.X_test)[:, 1]
        
        # Calcular métricas ROC
        fpr, tpr, _ = roc_curve(self.y_test, y_pred_proba)
        roc_auc = auc(fpr, tpr)
        
        # Generar reporte de clasificación
        report = classification_report(self.y_test, y_pred)
        
        # Crear reporte detallado
        print("\n=== REPORTE DE RENDIMIENTO DEL MODELO ===")
        print("\n1. Métricas de Rendimiento:")
        print(report)
        
        print("\n2. Área Bajo la Curva ROC (AUC):")
        print(f"AUC = {roc_auc:.3f}")
        
        print("\n3. Mejores Parámetros del Modelo:")
        for param, value in self.best_params.items():
            print(f"{param}: {value}")
        
        print("\n4. Características Más Importantes:")
        feature_importance = pd.DataFrame({
            'feature': self.X.columns,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        print(feature_importance.to_string(index=False))

    def predict_new_data(self, historial_path):
        """Predice el riesgo de deserción para nuevos estudiantes"""
        print(f"\nCargando datos de {historial_path}...")
        df_new = pd.read_excel(historial_path)
        df_new.columns = df_new.columns.str.strip()

        # Verificar si la columna 'EST' existe
        if 'EST' not in df_new.columns:
            print("Advertencia: La columna 'EST' no se encuentra en el archivo de datos.")
        
        # Identificar materias especiales
        materias_especiales = ['MIC – PI PROFESIONALIZANTE', 'COMP EXAMEN FIN DE CARRERA']
        
        print(f"Total de estudiantes en el archivo: {df_new['ID'].nunique()}")
        print("Columnas encontradas:", df_new.columns.tolist())
        
        # Filtrar solo los estudiantes del período 202351 y excluir graduados
        df_actual_periodo = df_new[(df_new['PERIODO'] == 202351) & (~df_new['ASIGNATURA'].isin(materias_especiales))]
        estudiantes_data = []
        
        for estudiante_id in df_actual_periodo['ID'].unique():
            df_estudiante = df_new[df_new['ID'] == estudiante_id]
            tiene_materias_especiales = df_estudiante['ASIGNATURA'].isin(materias_especiales).any()
            
            # Separar materias históricas y actuales
            df_historico = df_estudiante[df_estudiante['PERIODO'] != 202351]
            df_actual = df_estudiante[df_estudiante['PERIODO'] == 202351]
            
            # Calcular métricas relevantes
            metricas = {
                'ESTUDIANTE_ID': estudiante_id,
                'PROMEDIO': 0,
                'STD': 0,
                'RETIROS': 0,
                'TIENE_MATERIAS_ESPECIALES': tiene_materias_especiales,
                'TOTAL_MATERIAS_TODOS_PERIODOS': len(df_historico),
                'NÚMERO_TOTAL_PERIODOS': df_historico['PERIODO'].nunique(),
                'APROBADAS': 0,
                'PORCENTAJE_APROBACIÓN': 0,
                'MATERIAS_ACTUALES': len(df_actual),
                'REPROBADOS': 0  # Nueva métrica para reprobados
            }
            
            # Inicializar contadores para cada nivel
            for nivel in range(1, 9):
                metricas[f'APRO_N{nivel}'] = 0
                metricas[f'PERD_N{nivel}'] = 0
            
            # Procesar materias históricas
            notas_validas = []
            materias_aprobadas = 0
            
            for _, materia in df_historico.iterrows():
                notas_materia = []
                for col in ['1P', '2P', '3P']:
                    if col in materia and pd.notna(materia[col]):
                        try:
                            nota = float(str(materia[col]).replace(',', '.'))
                            if 0 <= nota <= 20:
                                notas_materia.append(nota)
                        except ValueError:
                            continue
                
                if notas_materia:
                    notas_validas.extend(notas_materia)
                    promedio_materia = np.mean(notas_materia)
                    
                    # Manejo seguro del nivel
                    try:
                        nivel_ref = str(materia['NIVEL REFERENCIAL'])
                        if pd.isna(nivel_ref) or nivel_ref == '':
                            nivel = 1  # Nivel por defecto si no hay información
                        else:
                            # Intenta extraer el número del nivel de diferentes formatos posibles
                            if 'NIVEL' in nivel_ref:
                                nivel = int(nivel_ref.split()[-1])
                            else:
                                # Si solo es un número o tiene otro formato
                                nivel = int(float(nivel_ref))
                            
                        # Asegurar que el nivel está en el rango correcto
                        nivel = max(1, min(8, nivel))  # Limitar entre 1 y 8
                    except:
                        nivel = 1  # Si hay cualquier error, usar nivel por defecto
                    
                    if promedio_materia >= 14:
                        materias_aprobadas += 1
                        metricas[f'APRO_N{nivel}'] += 1
                    else:
                        metricas[f'PERD_N{nivel}'] += 1
                        if 'EST' in materia and materia['EST'] == 'RP':
                            metricas['REPROBADOS'] += 1  # Contar reprobados
            
            # Actualizar métricas solo con materias históricas
            if notas_validas:
                metricas.update({
                    'PROMEDIO': np.mean(notas_validas),
                    'STD': np.std(notas_validas) if len(notas_validas) > 1 else 0,
                    'RETIROS': sum(1 for nota in notas_validas if nota < 14),
                    'APROBADAS': materias_aprobadas
                })
            
            # Calcular porcentaje de aprobación solo con materias históricas
            if metricas['TOTAL_MATERIAS_TODOS_PERIODOS'] > 0:
                metricas['PORCENTAJE_APROBACIÓN'] = (
                    materias_aprobadas / metricas['TOTAL_MATERIAS_TODOS_PERIODOS'] * 100
                )
            
            # Calcular materias por periodo (excluyendo el período actual)
            materias_por_periodo = df_historico.groupby('PERIODO')['ASIGNATURA'].count()
            metricas['MAX_MATERIAS_PERIODO'] = materias_por_periodo.max() if not materias_por_periodo.empty else 0
            
            estudiantes_data.append(metricas)

        # Crear DataFrame y preparar para predicción
        df_pred = pd.DataFrame(estudiantes_data)
        
        print("\nEstadísticas de estudiantes procesados:")
        print(f"Total de estudiantes con materias especiales: {df_pred['TIENE_MATERIAS_ESPECIALES'].sum()}")
        print(f"Promedio de materias por estudiante: {df_pred['TOTAL_MATERIAS_TODOS_PERIODOS'].mean():.2f}")
        print(f"Máximo de materias en un periodo: {df_pred['MAX_MATERIAS_PERIODO'].max()}")

        # Asegurarse de que todas las columnas necesarias estén presentes
        feature_cols = self.X.columns
        for col in feature_cols:
            if col not in df_pred.columns:
                df_pred[col] = 0
        
        X_pred = df_pred[feature_cols]
        X_pred_scaled = self.scaler.transform(X_pred)

        # Realizar predicciones
        probs = self.model.predict_proba(X_pred_scaled)[:, 1]

        # Preparar resultados
        results = df_pred.copy()
        results['PREDICCION_PROB'] = probs
        results['NIVEL_RIESGO'] = pd.cut(probs, bins=[0, 0.2, 0.4, 0.6, 0.8, 1], labels=['Muy Bajo', 'Bajo', 'Medio', 'Alto', 'Muy Alto'])

        # Guardar resultados
        output_file = 'predicciones_riesgo.xlsx'
        results.to_excel(output_file, index=False)
        print(f"\nResultados guardados en {output_file}")

        # Mostrar estudiantes con alto riesgo (> 80%)
        high_risk_students = results[results['PREDICCION_PROB'] > 0.8]
        print("\nEstudiantes con alto riesgo de deserción:")
        print(high_risk_students.head())

        return high_risk_students

if __name__ == "__main__":
    print("Iniciando entrenamiento del modelo...")
    model = MLDropoutAnalysis("DatasetTesis.xlsx")
    model.load_data().check_data_quality().prepare_features().split_and_balance().train_model().cross_validate_model().analyze_feature_importance()
    
    print("\nGenerando gráficas y reporte...")
    model.plot_metrics()
    model.generate_report()

    print("\nRealizando predicciones...")
    predictions = model.predict_new_data("historial_estudiantes_oficial.xlsx")
