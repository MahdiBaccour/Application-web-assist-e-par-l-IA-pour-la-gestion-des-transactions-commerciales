const API_URL = process.env.NEXT_PUBLIC_API_URL ;
export const getLogs = async (role = null, limit = 10, page = 1, token) => {
  try {
    const url = new URL(`${API_URL}/logs`);
    
    if (role) url.searchParams.append("role", role);
    url.searchParams.append("limit", Math.min(limit, 100));
    url.searchParams.append("page", Math.max(page, 1));

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.status === 400) {
      return { success: false, message: "Requête incorrecte. Veuillez vérifier les paramètres." };
    }
    if (response.status === 401) {
      return { success: false, message: "Non autorisé. Veuillez vous reconnecter." };
    }
    if (response.status === 403) {
      return { success: false, message: "Accès interdit. Permissions insuffisantes." };
    }
    if (response.status === 404) {
      return { success: false, message: "Aucun log trouvé." };
    }
    if (response.status === 500) {
      return { success: false, message: "Erreur serveur. Réessayez plus tard." };
    }
    if (response.ok) {
      return {
        success: true,
        logs: data.logs || [],
        total: data.count || 0,
        totalPages: data.totalPages || 1,
        currentPage: data.currentPage || 1
      };
    }

  } catch (error) {
    console.error("Erreur lors de la récupération des logs :", error);
    return { success: false, message: "Échec de la récupération des logs. Vérifiez votre connexion." };
  }
};