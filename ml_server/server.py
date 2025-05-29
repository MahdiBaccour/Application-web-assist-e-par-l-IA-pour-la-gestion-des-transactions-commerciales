from statistics import LinearRegression
from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import os
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
import requests
from flask import jsonify
import pandas as pd
import os
from sklearn.linear_model import LinearRegression

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "https://supplychainx.local"])

# CSV Paths
BASE_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../src/csv_exports"))
TRANSACTIONS_CSV = os.path.join(BASE_PATH, "transactions.csv")
PAYMENTS_CSV = os.path.join(BASE_PATH, "payments.csv")

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
        print("❌ Data loading error:", e)
        return None


@app.route("/api/classify", methods=["GET"])
def classify_clients():
    token = request.headers.get("Authorization")
    if not token:
        return jsonify({ "success": False, "message": "Token manquant." }), 401

    # Optional: Validate token format (e.g. starts with Bearer)
    if not token.startswith("Bearer "):
        return jsonify({ "success": False, "message": "Format du token invalide." }), 403

    data = load_and_preprocess()
    if data is None:
        return jsonify({ "success": False, "message": "Échec du chargement des données." }), 500

    try:
        scaler = StandardScaler()
        features = scaler.fit_transform(data[["total_paid", "transactions", "payment_ratio", "avg_payment"]])

        kmeans = KMeans(n_clusters=3, random_state=42)
        data["segment"] = kmeans.fit_predict(features)

        # ✅ Fix: Remap segment labels based on mean payment_ratio
        segment_means = data.groupby("segment")["payment_ratio"].mean().sort_values()
        segment_map = {old: new for new, old in enumerate(segment_means.index)}
        data["segment"] = data["segment"].map(segment_map)

        # Classification
        data["label"] = (data["payment_ratio"] >= 70).astype(int)  # Already in percentage after rounding

        X_train, X_test, y_train, y_test = train_test_split(
            features, data["label"], test_size=0.2, random_state=42
        )

        rf = RandomForestClassifier(n_estimators=100, random_state=42)
        rf.fit(X_train, y_train)
        data["rf_class"] = rf.predict(features)

        # Round values for frontend
        data = data.round(2)
        data["payment_ratio"] = data["payment_ratio"].round(2) * 100
        data["avg_payment"] = data["avg_payment"].round(2)

        return jsonify({
            "success": True,
            "data": data.to_dict(orient="records")
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

        return jsonify({ "success": True, "data": grouped.to_dict(orient="records") })
    except Exception as e:
        return jsonify({ "success": False, "message": "Erreur de classification ML", "error": str(e) }), 500
    


@app.route("/api/predict/budget", methods=["GET"])
def predict_budget():
    try:
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"success": False, "message": "Token manquant dans l'en-tête."}), 401

        months = int(request.args.get("months", 12))

        headers = {
            "Authorization": token
        }

        # Get budget data
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

        features = df[["month", "year"]]
        targets = {
            "total_income_brut": df["total_income_brut"],
            "total_income_net": df["total_income_net"],
            "total_expenses": df["total_expenses"],
            "net_balance": df["net_balance"]
        }

        models = {key: LinearRegression().fit(features, target) for key, target in targets.items()}

        predictions = []
        print(df["month_date"].max())
        last_date = df["month_date"].max()
        year = last_date.year
        month = last_date.month

        for _ in range(months):
            month += 1
            if month > 12:
                month = 1
                year += 1

            input_features = [[month, year]]
            prediction = {
                "month": f"{year}-{str(month).zfill(2)}"
            }

            for key, model in models.items():
                prediction[key] = round(model.predict(input_features)[0], 2)

            predictions.append(prediction)

        return jsonify({
            "success": True,
            "predictions": predictions
        })

    except Exception as e:
        return jsonify({"success": False, "message": "Erreur de prédiction", "error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)