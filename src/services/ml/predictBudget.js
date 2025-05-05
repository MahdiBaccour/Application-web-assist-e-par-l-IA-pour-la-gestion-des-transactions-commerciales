export  const predictNextBudgets = async (token, months = 12) => {
  try {
    const url = new URL("http://127.0.0.1:5000/api/predict/budget");
    url.searchParams.append("months", months);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await response.json();

    if (response.status === 400) {
      return { success: false, message: "Requête invalide." };
    }
    if (response.status === 401) {
      return { success: false, message: "Token manquant ou invalide." };
    }
    if (response.status === 403) {
      return { success: false, message: "Accès refusé." };
    }
    if (response.status === 500) {
      return { success: false, message: "Erreur serveur lors de la prédiction." };
    }
    if (!json.success) {
      return { success: false, message: json.message || "Erreur lors de la prédiction." };
    }

    return { success: true, predictions: json.predictions };

  } catch (error) {
    console.error("Prediction error:", error);
    return {
      success: false,
      message: "Échec de connexion au serveur Flask.",
    };
  }
};