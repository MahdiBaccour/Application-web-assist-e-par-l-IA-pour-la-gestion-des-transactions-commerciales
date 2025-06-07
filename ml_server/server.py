from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import os
import requests
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
import matplotlib
matplotlib.use('Agg')  # Utilise le backend non interactif
import matplotlib.pyplot as plt
import seaborn as sns

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "https://supplychainx.local"])

# Chemins
BASE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../src/csv_exports"))
GRAPH_DIR = os.path.join(BASE_PATH, "../graphiques")
TRANSACTIONS_CSV = os.path.join(BASE_PATH, "transactions.csv")
PAYMENTS_CSV = os.path.join(BASE_PATH, "payments.csv")

os.makedirs(BASE_PATH, exist_ok=True)
os.makedirs(GRAPH_DIR, exist_ok=True)

def load_and_preprocess():
    try:
        transactions = pd.read_csv(TRANSACTIONS_CSV)
        payments = pd.read_csv(PAYMENTS_CSV)
        df = pd.merge(transactions, payments, left_on="id", right_on="transaction_id", how="left")
        df = df[df["client_id"].notna()]

        grouped = df.groupby("client_id").agg({
            "amount_paid": "sum",
            "amount": "sum",
            "id": "count"
        }).reset_index()

        grouped.columns = ["client_id", "total_paid", "total_billed", "transactions"]
        grouped["payment_ratio"] = grouped["total_paid"] / grouped["total_billed"]
        grouped["avg_payment"] = grouped["total_paid"] / grouped["transactions"]
        grouped.fillna(0, inplace=True)
        return grouped
    except Exception as e:
        print("❌ Erreur de chargement des données:", e)
        return None

def generate_correlation_heatmap(data, filename, title="Matrice de Corrélation"):
    plt.figure(figsize=(10, 8))
    corr = data.corr()
    sns.heatmap(corr, annot=True, cmap="coolwarm", fmt=".2f", linewidths=.5, annot_kws={"size": 10})
    plt.title(title, fontsize=14)
    plt.xticks(rotation=45, ha='right', fontsize=10)
    plt.yticks(fontsize=10)
    plt.tight_layout()
    plt.savefig(os.path.join(GRAPH_DIR, filename))
    plt.close()

def generate_scatter_plot(data, x_col, y_col, hue_col, filename, title="Nuage de Points"):
    plt.figure(figsize=(10, 8))
    sns.scatterplot(data=data, x=x_col, y=y_col, hue=hue_col, palette="viridis", s=100, alpha=0.8)
    plt.title(title, fontsize=14)
    plt.xlabel(x_col, fontsize=12)
    plt.ylabel(y_col, fontsize=12)
    plt.grid(True, linestyle='--', alpha=0.7)
    plt.legend(title=hue_col, title_fontsize=12, fontsize=10)
    plt.tight_layout()
    plt.savefig(os.path.join(GRAPH_DIR, filename))
    plt.close()

@app.route("/api/classify", methods=["GET"])
def classify_clients():
    token = request.headers.get("Authorization")
    if not token or not token.startswith("Bearer "):
        return jsonify({ "success": False, "message": "Token manquant ou invalide." }), 401

    data = load_and_preprocess()
    if data is None:
        return jsonify({ "success": False, "message": "Échec du chargement des données." }), 500

    try:
        scaler = StandardScaler()
        features = scaler.fit_transform(data[["total_paid", "transactions", "payment_ratio", "avg_payment"]])

        kmeans = KMeans(n_clusters=3, random_state=42)
        data["segment"] = kmeans.fit_predict(features)
        segment_means = data.groupby("segment")["payment_ratio"].mean().sort_values()
        segment_map = {old: new for new, old in enumerate(segment_means.index)}
        data["segment"] = data["segment"].map(segment_map)

        data["label"] = (data["payment_ratio"] >= 0.7).astype(int)
        X_train, X_test, y_train, y_test = train_test_split(
            features, data["label"], test_size=0.2, random_state=42
        )
        rf = RandomForestClassifier(n_estimators=100, random_state=42)
        rf.fit(X_train, y_train)
        data["rf_class"] = rf.predict(features)

        data = data.round(2)
        data["payment_ratio"] = (data["payment_ratio"] * 100).round(2)
        data["avg_payment"] = data["avg_payment"].round(2)

        generate_correlation_heatmap(
            data[["total_paid", "transactions", "payment_ratio", "avg_payment"]],
            "client_correlation.png",
            "Corrélations - Données Clients"
        )

        generate_scatter_plot(
            data,
            x_col="total_billed",
            y_col="total_paid",
            hue_col="segment",
            filename="client_scatter.png",
            title="Segmentation Clients - Montant Facturé vs Montant Payé"
        )

        return jsonify({
            "success": True,
            "data": data.to_dict(orient="records"),
            "correlation_image": "/graphiques/client_correlation.png",
            "scatter_image": "/graphiques/client_scatter.png"
        })
    except Exception as e:
        return jsonify({ "success": False, "message": "Erreur de classification ML", "error": str(e) }), 500

@app.route("/api/classify/suppliers", methods=["GET"])
def classify_suppliers():
    token = request.headers.get("Authorization")
    if not token or not token.startswith("Bearer "):
        return jsonify({ "success": False, "message": "Token manquant ou invalide." }), 401

    try:
        transactions = pd.read_csv(TRANSACTIONS_CSV)
        payments = pd.read_csv(PAYMENTS_CSV)
        df = pd.merge(transactions, payments, left_on="id", right_on="transaction_id", how="left")
        df = df[df["supplier_id"].notna()]

        grouped = df.groupby("supplier_id").agg({
            "amount_paid": "sum",
            "amount": "sum",
            "id": "count"
        }).reset_index()

        grouped.columns = ["supplier_id", "total_paid", "total_billed", "transactions"]
        grouped["payment_ratio"] = grouped["total_paid"] / grouped["total_billed"]
        grouped["avg_payment"] = grouped["total_paid"] / grouped["transactions"]
        grouped.fillna(0, inplace=True)

        scaler = StandardScaler()
        features = scaler.fit_transform(grouped[["total_paid", "transactions", "payment_ratio", "avg_payment"]])

        kmeans = KMeans(n_clusters=3, random_state=42)
        grouped["segment"] = kmeans.fit_predict(features)
        segment_means = grouped.groupby("segment")["payment_ratio"].mean().sort_values()
        segment_map = {old: new for new, old in enumerate(segment_means.index)}
        grouped["segment"] = grouped["segment"].map(segment_map)

        grouped["label"] = (grouped["payment_ratio"] >= 0.7).astype(int)
        rf = RandomForestClassifier(n_estimators=100, random_state=42)
        rf.fit(features, grouped["label"])
        grouped["rf_class"] = rf.predict(features)

        grouped = grouped.round(2)
        grouped["payment_ratio"] = (grouped["payment_ratio"] * 100).round(2)
        grouped["avg_payment"] = grouped["avg_payment"].round(2)

        generate_correlation_heatmap(
            grouped[["total_paid", "transactions", "payment_ratio", "avg_payment"]],
            "supplier_correlation.png",
            "Corrélations - Données Fournisseurs"
        )

        generate_scatter_plot(
            grouped,
            x_col="total_billed",
            y_col="total_paid",
            hue_col="segment",
            filename="supplier_scatter.png",
            title="Segmentation Fournisseurs - Montant Facturé vs Montant Payé"
        )

        return jsonify({ 
            "success": True, 
            "data": grouped.to_dict(orient="records"),
            "correlation_image": "/graphiques/supplier_correlation.png",
            "scatter_image": "/graphiques/supplier_scatter.png"
        })
    except Exception as e:
        return jsonify({ "success": False, "message": "Erreur de classification ML", "error": str(e) }), 500

@app.route("/api/predict/budget", methods=["GET"])
def predict_budget():
    try:
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"success": False, "message": "Token manquant dans l'en-tête."}), 401

        months = int(request.args.get("months", 12))
        headers = { "Authorization": token }

        res = requests.get("http://localhost:3001/api/total_budget", headers=headers)
        if res.status_code != 200:
            return jsonify({"success": False, "message": f"Erreur API budget: {res.status_code}"}), res.status_code

        json_data = res.json()
        if not json_data.get("success"):
            return jsonify({"success": False, "message": json_data.get("message", "Échec API.")}), 500

        records = json_data["budgets"]
        df = pd.DataFrame(records)
        df['month_date'] = pd.to_datetime(df['month_date'])
        df.sort_values('month_date', inplace=True)
        df['month'] = df['month_date'].dt.month
        df['year'] = df['month_date'].dt.year

        generate_correlation_heatmap(
            df[["total_income_brut", "total_income_net", "total_expenses", "net_balance"]],
            "budget_correlation.png",
            "Corrélations - Données Budgétaires"
        )

        features = df[["month", "year"]]
        targets = {
            "total_income_brut": df["total_income_brut"],
            "total_income_net": df["total_income_net"],
            "total_expenses": df["total_expenses"],
            "net_balance": df["net_balance"]
        }

        models = {key: LinearRegression().fit(features, target) for key, target in targets.items()}

        predictions = []
        last_date = df["month_date"].max()
        year, month = last_date.year, last_date.month

        for _ in range(months):
            month += 1
            if month > 12:
                month = 1
                year += 1

            input_features = [[month, year]]
            prediction = { "month": f"{year}-{str(month).zfill(2)}" }
            for key, model in models.items():
                prediction[key] = round(model.predict(input_features)[0], 2)

            predictions.append(prediction)

        return jsonify({
            "success": True,
            "predictions": predictions,
            "correlation_image": "/graphiques/budget_correlation.png"
        })

    except Exception as e:
        return jsonify({"success": False, "message": "Erreur de prédiction", "error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)
