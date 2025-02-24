import warnings
import pandas as pd
from imblearn.over_sampling import SMOTE

# Suprimir advertencias
warnings.filterwarnings("ignore", category=UserWarning, module="openpyxl")

# Cargar dataset
df = pd.read_excel("DatasetTesis.xlsx", engine="openpyxl")

# Separar características (X) y etiquetas (y)
X = df.drop(columns=["STATUS"])  # Asegúrate de ajustar a tu columna objetivo
y = df["STATUS"]

# Aplicar SMOTE
smote = SMOTE(random_state=42)
X_resampled, y_resampled = smote.fit_resample(X, y)

# Combinar en un DataFrame para exportar
df_resampled = pd.concat([pd.DataFrame(X_resampled, columns=X.columns), 
                          pd.DataFrame(y_resampled, columns=["STATUS"])], axis=1)
from collections import Counter

print("Distribución original de clases:", Counter(y))
print("Distribución después de SMOTE:", Counter(y_resampled))

# Guardar como un nuevo archivo
df_resampled.to_excel("DatasetTesis_SMOTE.xlsx", index=False, engine="openpyxl")
