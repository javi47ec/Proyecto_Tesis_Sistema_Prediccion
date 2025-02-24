import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import learning_curve, train_test_split, RandomizedSearchCV
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import classification_report, confusion_matrix, roc_curve, auc
from imblearn.over_sampling import SMOTE
from sklearn.metrics import ConfusionMatrixDisplay
import joblib
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

        # ⚠️ No filtrar por 'PERIODO' porque DatasetTesis.xlsx no tiene esa columnas
        print(f"Tamaño total del dataset: {self.df.shape}")
        print("\nPrimeras filas del dataset:")
        print(self.df.head())
        return self
    
    def prepare_features(self):
        """Prepara las características para el modelo"""
        feature_cols = ['PROMEDIO', 'STD']
        for i in range(1, 9):
            feature_cols.extend([f'APRO_N{i}', f'PERD_N{i}'])
        if 'REPROBADO' in self.df.columns:
            feature_cols.append('REPROBADO')

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
        print("\nRealizando evaluación completa del modelo...")
        
        
        print("\nIniciando búsqueda de mejores parámetros para RandomForest...")
        rf = RandomForestClassifier(random_state=42)
        grid_search_rf = RandomizedSearchCV(rf, param_grid_rf, cv=3, scoring='f1', n_jobs=-1, n_iter=10, random_state=42)
        grid_search_rf.fit(self.X_train, self.y_train)

        self.model = grid_search_rf.best_estimator_  # ✅ Ya tenemos el mejor modelo
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

        # Guardar modelo entrenado
        joblib.dump(self.model, 'modelo_desercion.pkl')
        print("\nModelo guardado en 'modelo_desercion.pkl'")

        # Guardar el escalador para usarlo en predicciones
        joblib.dump(self.scaler, 'scaler_desercion.pkl')
        print("Escalador guardado en 'scaler_desercion.pkl'")

        self.evaluate_model() # Llamar al nuevo método
        return self

    def predict_new_data(self, historial_path):
        """Predice el riesgo de deserción con mejor manejo de valores NaN"""
        print(f"\nCargando datos de {historial_path}...")
        df_new = pd.read_excel(historial_path)
        df_new.columns = df_new.columns.str.strip()

        # Validar columnas necesarias
        if 'PERIODO' not in df_new.columns:
            raise ValueError("⚠️ Error: La columna 'PERIODO' no se encuentra en el archivo.")
        if 'ID' not in df_new.columns:
            raise ValueError("⚠️ Error: La columna 'ID' no se encuentra en el archivo.")

        # Filtrar por período
        df_new = df_new[df_new['PERIODO'] == 202450]
        print(f"Registros después de filtrar por PERIODO 202450: {df_new.shape[0]}")

        # Mapear niveles a números
        nivel_mapping = {
            "PRIMER NIVEL": 1, "SEGUNDO NIVEL": 2, "TERCER NIVEL": 3, 
            "CUARTO NIVEL": 4, "QUINTO NIVEL": 5, "SEXTO NIVEL": 6, 
            "SEPTIMO NIVEL": 7, "OCTAVO NIVEL": 8
        }
        
        # Convertir niveles a números y manejar casos especiales
        df_new['NIVEL_NUM'] = df_new['NIVEL REFERENCIAL'].map(nivel_mapping).fillna(0).astype(int)
        
        # Calcular métricas base por estudiante
        df_pred = df_new.groupby('ID').agg(
            PROMEDIO=('PROMEDIO', 'mean'),
            STD=('PROMEDIO', 'std'),
            REPROBADO=('EST', lambda x: (x == 'RP').sum())
        ).reset_index()

        # Llenar STD NaN con 0 (casos con una sola nota)
        df_pred['STD'] = df_pred['STD'].fillna(0)

        # Inicializar columnas de aprobados y reprobados
        for nivel in range(1, 9):
            df_pred[f'APRO_N{nivel}'] = 0
            df_pred[f'PERD_N{nivel}'] = 0

        # Calcular aprobados y reprobados por nivel
        for idx, student_id in enumerate(df_pred['ID']):
            student_data = df_new[df_new['ID'] == student_id]
            
            for nivel in range(1, 9):
                nivel_data = student_data[student_data['NIVEL_NUM'] == nivel]
                
                if not nivel_data.empty:
                    # Contar aprobados (PROMEDIO >= 14.1)
                    aprobados = nivel_data[nivel_data['PROMEDIO'] >= 14.1].shape[0]
                    reprobados = nivel_data[nivel_data['PROMEDIO'] < 14.1].shape[0]
                    
                    df_pred.loc[idx, f'APRO_N{nivel}'] = aprobados
                    df_pred.loc[idx, f'PERD_N{nivel}'] = reprobados

        # Asegurar que todas las columnas necesarias estén presentes
        feature_cols = self.X.columns
        for col in feature_cols:
            if col not in df_pred.columns:
                df_pred[col] = 0

        # Filtrar estudiantes sin notas
        df_pred = df_pred[df_pred['PROMEDIO'] > 0]

        if df_pred.empty:
            raise ValueError("⚠️ Error: No hay estudiantes con datos válidos para predecir.")

        # Realizar predicciones
        X_pred_scaled = self.scaler.transform(df_pred[feature_cols])
        probs = self.model.predict_proba(X_pred_scaled)[:, 1]

        # Preparar resultados
        results = df_pred.copy()
        results['PREDICCION_PROB'] = probs
        results['NIVEL_RIESGO'] = pd.cut(
            probs, 
            bins=[0, 0.2, 0.4, 0.6, 0.8, 1], 
            labels=['Muy Bajo', 'Bajo', 'Medio', 'Alto', 'Muy Alto']
        )

        # Guardar resultados
        output_file = 'predicciones_riesgo.xlsx'
        results.to_excel(output_file, index=False)
        print(f"\nResultados guardados en {output_file}")

        # Mostrar estudiantes en riesgo
        high_risk = results[results['PREDICCION_PROB'] > 0.7]
        if not high_risk.empty:
            print("\nEstudiantes con alto riesgo de deserción:")
            print(high_risk[['ID', 'PROMEDIO', 'PREDICCION_PROB', 'NIVEL_RIESGO']].head())

        return results

    def evaluate_model(self):
        """Evalúa el modelo con múltiples métricas y visualizaciones"""
        print("\nRealizando evaluación completa del modelo...")
        
        # Obtener predicciones y probabilidades
        y_pred = self.model.predict(self.X_test)
        y_prob = self.model.predict_proba(self.X_test)[:, 1]
        
        # 1. Curva ROC y AUC
        fpr, tpr, _ = roc_curve(self.y_test, y_prob)
        roc_auc = auc(fpr, tpr)
        
        plt.figure(figsize=(10, 6))
        plt.plot(fpr, tpr, color='darkorange', lw=2, 
                label=f'ROC curve (AUC = {roc_auc:.2f})')
        plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
        plt.xlim([0.0, 1.0])
        plt.ylim([0.0, 1.05])
        plt.xlabel('Tasa de Falsos Positivos')
        plt.ylabel('Tasa de Verdaderos Positivos')
        plt.title('Curva ROC (Receiver Operating Characteristic)')
        plt.legend(loc="lower right")
        plt.show()
        
        # 2. Matriz de Confusión con porcentajes
        cm = confusion_matrix(self.y_test, y_pred)
        cm_percent = cm.astype('float') / cm.sum(axis=1)[:, np.newaxis] * 100
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
        
        # Matriz de confusión con números absolutos
        disp = ConfusionMatrixDisplay(confusion_matrix=cm, 
                                    display_labels=['No Desertor', 'Desertor'])
        disp.plot(ax=ax1, cmap='Blues', values_format='d')
        ax1.set_title('Matriz de Confusión (Valores Absolutos)')
        
        # Matriz de confusión con porcentajes
        sns.heatmap(cm_percent, annot=True, fmt='.1f', cmap='Blues', ax=ax2)
        ax2.set_xlabel('Predicción')
        ax2.set_ylabel('Valor Real')
        ax2.set_title('Matriz de Confusión (Porcentajes)')
        ax2.set_xticklabels(['No Desertor', 'Desertor'])
        ax2.set_yticklabels(['No Desertor', 'Desertor'])
        plt.tight_layout()
        plt.show()
        
        # 3. Feature Importance
        feature_importance = pd.DataFrame({
            'feature': self.X.columns,
            'importance': self.model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        plt.figure(figsize=(12, 6))
        sns.barplot(data=feature_importance.head(10), 
                    x='importance', y='feature')
        plt.title('Top 10 Características Más Importantes')
        plt.xlabel('Importancia')
        plt.ylabel('Característica')
        plt.tight_layout()
        plt.show()
        
        # 4. Learning Curves
        train_sizes = np.linspace(0.1, 1.0, 10)
        train_sizes, train_scores, test_scores = learning_curve(
            self.model, self.X, self.y, 
            train_sizes=train_sizes, cv=5, 
            scoring='accuracy', n_jobs=-1
        )
        
        train_mean = np.mean(train_scores, axis=1)
        train_std = np.std(train_scores, axis=1)
        test_mean = np.mean(test_scores, axis=1)
        test_std = np.std(test_scores, axis=1)
        
        plt.figure(figsize=(10, 6))
        plt.plot(train_sizes, train_mean, label='Train', color='blue', marker='o')
        plt.fill_between(train_sizes, 
                        train_mean - train_std, 
                        train_mean + train_std, 
                        alpha=0.15, color='blue')
        plt.plot(train_sizes, test_mean, label='Validation', color='green', marker='o')
        plt.fill_between(train_sizes, 
                        test_mean - test_std, 
                        test_mean + test_std, 
                        alpha=0.15, color='green')
        plt.xlabel('Tamaño del Conjunto de Entrenamiento')
        plt.ylabel('Accuracy')
        plt.title('Curvas de Aprendizaje')
        plt.legend(loc='lower right')
        plt.grid(True)
        plt.show()
        
        # 5. Métricas detalladas
        print("\nMétricas Detalladas:")
        print("-" * 50)
        print(f"AUC-ROC: {roc_auc:.3f}")
        
        report = classification_report(self.y_test, y_pred, output_dict=True)
        metrics_df = pd.DataFrame(report).transpose()
        print("\nReporte de Clasificación Detallado:")
        print(metrics_df)
        
        # 6. Errores más comunes
        errors_idx = np.where(y_pred != self.y_test)[0]
        errors_data = pd.DataFrame({
            'Real': self.y_test.iloc[errors_idx],
            'Predicho': y_pred[errors_idx],
            'Probabilidad': y_prob[errors_idx]
        })
        
        print("\nAnálisis de Errores:")
        print(f"Total de errores: {len(errors_idx)}")
        print("\nDistribución de errores:")
        print(pd.crosstab(errors_data['Real'], 
                        errors_data['Predicho'], 
                        margins=True))
        
        return {
            'auc_roc': roc_auc,
            'confusion_matrix': cm,
            'feature_importance': feature_importance,
            'classification_report': metrics_df
        }



if __name__ == "__main__":
    print("Iniciando entrenamiento del modelo...")
    model = MLDropoutAnalysis("DatasetTesis.xlsx")
    model.load_data().prepare_features().split_and_balance().train_model()

    # Obtener metricas detalladas
    evaluation_results = model.evaluate_model()





    print("\nRealizando predicciones...")
    predictions = model.predict_new_data("historial_estudiantes_oficial.xlsx")
