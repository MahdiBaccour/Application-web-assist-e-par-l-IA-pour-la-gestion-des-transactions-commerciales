from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd
import os
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

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
    data = load_and_preprocess()
    if data is None:
        return jsonify({ "success": False, "message": "Échec du chargement des données." }), 500

    try:
        scaler = StandardScaler()
        features = scaler.fit_transform(data[["total_paid", "transactions", "payment_ratio", "avg_payment"]])

        # Clustering
        kmeans = KMeans(n_clusters=3, random_state=42)
        data["segment"] = kmeans.fit_predict(features)

        # Labeling for classification
        data["label"] = (data["payment_ratio"] >= 0.7).astype(int)

        X_train, X_test, y_train, y_test = train_test_split(
            features, data["label"], test_size=0.2, random_state=42
        )

        rf = RandomForestClassifier(n_estimators=100, random_state=42)
        rf.fit(X_train, y_train)
        data["rf_class"] = rf.predict(features)

        # Round values for frontend
        data = data.round(2)
        data["payment_ratio"] = (data["payment_ratio"]).round(2)*100
        data["avg_payment"] = data["avg_payment"].round(2)

        return jsonify({
            "success": True,
            "data": data.to_dict(orient="records")
        })

    except Exception as e:
        return jsonify({ "success": False, "message": "Erreur de classification ML", "error": str(e) }), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)