// services/logs/emailLogService.js
const API_URL = process.env.NEXT_PUBLIC_API_URL ;
export const getEmailLogs = async (filters = {}, token) => {
  try {
    const url = new URL(`${API_URL}/contact-admin`);
    
    // Add filters
    const { email, username, status, start_date, end_date, limit = 50, page = 1 } = filters;
    
    if (email) url.searchParams.append("email", email);
    if (username) url.searchParams.append("username", username);
    if (status) url.searchParams.append("status", status);
    if (start_date) url.searchParams.append("start_date", start_date);
    if (end_date) url.searchParams.append("end_date", end_date);
    
    url.searchParams.append("limit", Math.min(limit, 100));
    url.searchParams.append("page", Math.max(page, 1));

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    // Handle responses
    if (response.status === 400) {
      return { success: false, message: "Paramètres de filtre invalides" };
    }
    if (response.status === 403) {
      return { success: false, message: "Accès non autorisé" };
    }
    if (response.status === 500) {
      return { success: false, message: "Erreur serveur" };
    }
    if (response.ok) {
      return {
        success: true,
        logs: data.logs || [],
        count: data.count || 0,
        totalPages: data.totalPages || 1,
        currentPage: data.currentPage || 1
      };
    }

    return { success: false, message: "Erreur inconnue" };

  } catch (error) {
    console.error("Erreur récupération des logs emails:", error);
    return { success: false, message: "Échec de la connexion au serveur" };
  }
};