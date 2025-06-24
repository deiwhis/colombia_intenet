import pandas as pd
import json

archivo = "ACCESOS FIJOS A INTERNET POR DEPARTAMENTO Y POBLACIÓN.csv"

# Leer CSV con punto y coma como separador
df = pd.read_csv(archivo, encoding="latin1", sep=";")

# Limpiar nombres de columnas
df.columns = df.columns.str.strip()

# Mostrar nombres de columnas para confirmar
print("Columnas detectadas:", df.columns.tolist())

# Agrupar por departamento
accesos = df.groupby("DEPARTAMENTO")["No. ACCESOS FIJOS A INTERNET"].sum().reset_index()
accesos.columns = ["departamento", "accesos"]

# Convertir a JSON
data = accesos.to_dict(orient="records")

# Guardar archivo
with open("accesos_departamento.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

print("✅ Archivo 'accesos_departamento.json' generado correctamente.")
