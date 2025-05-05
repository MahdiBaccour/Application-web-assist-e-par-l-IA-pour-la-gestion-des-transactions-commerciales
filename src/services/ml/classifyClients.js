let cachedData = null;

export const classifyClients = async (token) => {
  if (cachedData) return { success: true, data: cachedData };

  try {
    const response = await fetch("http://127.0.0.1:5000/api/classify", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const json = await response.json();

    if (response.status === 400) return { success: false, message: "Requête invalide." };
    if (response.status === 401) return { success: false, message: "Non autorisé. Veuillez vous reconnecter." };
    if (response.status === 403) return { success: false, message: "Accès interdit. Token invalide." };
    if (response.status === 500) return { success: false, message: "Erreur serveur lors de la classification." };

    if (!json.success) return { success: false, message: json.message || "Erreur inconnue." };

    cachedData = json.data;
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, message: "Erreur réseau. Vérifiez votre connexion." };
  }
};