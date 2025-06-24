from flask import Flask, render_template, jsonify
import pandas as pd
import os

# Definimos las rutas relativas
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, 'data', 'minitic_2024.xlsx')  # cambia este nombre si usas otro

# Crear app Flask
app = Flask(__name__, template_folder='../templates', static_folder='../static')

# Ruta principal que renderiza el HTML
@app.route("/")
def home():
    return render_template("index.html")

# Ruta API para enviar datos en formato JSON (temporalmente vacía)
@app.route("/api/datos")
def datos():
    if os.path.exists(DATA_FILE):
        df = pd.read_excel(DATA_FILE, sheet_name=0)
        return jsonify(df.to_dict(orient="records"))
    else:
        return jsonify({"error": "Archivo no encontrado", "ruta": DATA_FILE}), 404

# Ejecutar el servidor Flask
if __name__ == "__main__":
    app.run(debug=True)
