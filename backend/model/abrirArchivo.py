import joblib

scaler = joblib.load("scaler_desercion.pkl")
print("✅ El escalador espera", scaler.n_features_in_, "características.")
