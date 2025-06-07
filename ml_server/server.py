from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd, os, requests
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
import matplotlib
matplotlib.use('Agg')  # Utilise le backend non interactif
import matplotlib.pyplot as plt
import seaborn as sns

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:3000",
    "https://supplychainx.local"
])

# chemins CSV « mountés »
BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), "../src/csv_exports"))
TRANSACTIONS_CSV = os.path.join(BASE, "transactions.csv")
PAYMENTS_CSV      = os.path.join(BASE, "payments.csv")

# ─────────────────────────────────────────────
def load_and_preprocess(role="client"):          # role = "client" | "supplier"
    try:
        trx  = pd.read_csv(TRANSACTIONS_CSV)
        pay  = pd.read_csv(PAYMENTS_CSV)

        df   = pd.merge(trx, pay, left_on="id", right_on="transaction_id", how="left")
        key  = "client_id" if role == "client" else "supplier_id"
        df   = df[df[key].notna()]

        g = df.groupby(key).agg({
            "amount_paid": "sum",
            "amount":      "sum",
            "id":          "count"
        }).reset_index()

        g.columns        = [key, "total_paid", "total_billed", "transactions"]
        g["payment_ratio"] = g["total_paid"] / g["total_billed"]        # 0-1
        g["avg_payment"]   = g["total_paid"] / g["transactions"]
        g.fillna(0, inplace=True)
        return g
    except Exception as exc:
        print("❌ Pré-processing error :", exc)
        return None
# ─────────────────────────────────────────────
def classify_generic(role="client"):
    data = load_and_preprocess(role)
    if data is None:
        return jsonify({"success": False,
                        "message": "Échec du chargement des données."}), 500

    scaler   = StandardScaler()
    feats    = scaler.fit_transform(
        data[["total_paid", "transactions", "payment_ratio", "avg_payment"]])

    # ---- segmentation K-Means
    km       = KMeans(n_clusters=3, random_state=42).fit(feats)
    data["segment"] = km.labels_
    means    = data.groupby("segment")["payment_ratio"].mean().sort_values()
    seg_map  = {old: new for new, old in enumerate(means.index)}
    data["segment"] = data["segment"].map(seg_map)

    # ---- label binaire (corrigé) — seuil 0.7
    data["label"]  = (data["payment_ratio"] >= 0.7).astype(int)

    X_train,X_test,y_train,y_test = train_test_split(
        feats, data["label"], test_size=0.2, random_state=42)

    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X_train, y_train)
    data["rf_class"] = rf.predict(feats)           # prédiction brute

    # ---- rendu lisible pour le front
    data = data.round(2)
    data["payment_ratio"] = (data["payment_ratio"]*100).round(2)
    data["avg_payment"]   = data["avg_payment"].round(2)

    return jsonify({"success": True,
                    "data": data.to_dict(orient="records")})
# ─────────────────────────────────────────────
@app.route("/api/classify",           methods=["GET"])
def classify_clients():   return auth_wrap(classify_generic, "client")

@app.route("/api/classify/suppliers", methods=["GET"])
def classify_suppliers(): return auth_wrap(classify_generic, "supplier")
# ─────────────────────────────────────────────
def auth_wrap(f, role_arg):
    tok = request.headers.get("Authorization")
    if not tok or not tok.startswith("Bearer "):
        return jsonify({"success":False, "message":"Token manquant ou invalide."}), 401
    return f(role_arg)   # exécute la classification
# ─────────────────────────────────────────────
@app.route("/api/predict/budget", methods=["GET"])
def predict_budget():
    """Prévision du budget global N mois en avance (régression linéaire multivariée)."""
    token = request.headers.get("Authorization")
    if not token:   # même check simplifié
        return jsonify({"success":False, "message":"Token manquant."}), 401

    months = int(request.args.get("months", 12))
    # 1) Récupère l’historique budget via le micro-service finances
    res = requests.get("http://localhost:3001/api/total_budget",
                       headers={"Authorization": token})
    if res.status_code != 200 or not res.json().get("success"):
        return jsonify({"success":False, "message":"Erreur API budget"}), res.status_code

    df = (pd.DataFrame(res.json()["budgets"])
            .assign(month_date = lambda d: pd.to_datetime(d.month_date))
            .sort_values("month_date"))
    df["month"] = df.month_date.dt.month
    df["year"]  = df.month_date.dt.year

    # 2) Entraîne 4 régressions indépendantes
    X   = df[["month","year"]]
    targets = ["total_income_brut","total_income_net","total_expenses","net_balance"]
    models  = {col:LinearRegression().fit(X, df[col]) for col in targets}

    # 3) Génère les N mois futurs
    current = df.month_date.max()
    y, m = current.year, current.month
    preds = []
    for _ in range(months):
        m += 1
        if m>12: m, y = 1, y+1
        X_new = [[m, y]]
        pred  = {"month": f"{y}-{m:02d}"}
        for col, model in models.items():
            pred[col] = round(float(model.predict(X_new)), 2)
        preds.append(pred)

    return jsonify({"success":True,"predictions":preds})
# ─────────────────────────────────────────────
if __name__ == "__main__":
    app.run(port=5000, debug=True)
