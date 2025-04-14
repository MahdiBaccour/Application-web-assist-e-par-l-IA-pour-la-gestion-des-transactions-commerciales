// utils/api/performance.js
export const getPerformanceData = async (token) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats/performance`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
  
      if (!response.ok) {
        const error = await response.json()
        return { success: false, message: error.message || 'Failed to fetch performance data' }
      }
  
      return await response.json()
    } catch (error) {
      return { success: false, message: 'Network error' }
    }
  }

  export const getChartData = async (token) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stats/charts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
  
      if (!response.ok) {
        const error = await response.json()
        return { success: false, message: error.message || 'Failed to fetch performance data' }
      }
  
      return await response.json()
    } catch (error) {
      return { success: false, message: 'Network error' }
    }
  }


export const getTopProducts = async (token, limit = 5) => {
  try {
    const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/stats/products/top`, window.location.origin);
    url.searchParams.append("limit", limit);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (!response.ok) {
      const message = {
        400: "Requête invalide.",
        401: "Non autorisé.",
        403: "Accès refusé.",
        404: "Aucun produit trouvé.",
        500: "Erreur serveur."
      }[response.status] || "Erreur inconnue.";
      return { success: false, message };
    }

    return { success: true, data: data.data };
  } catch (error) {
    console.error("Erreur top produits:", error);
    return { success: false, message: "Impossible de récupérer les données des produits." };
  }
};

export const getBudgetData = async (token, year = '') => {
    try {
      const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/stats/budget`, window.location.origin);
      if (year) url.searchParams.append('year', year);
  
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        const message = {
          400: "Requête invalide. Vérifiez vos entrées.",
          401: "Accès non autorisé. Veuillez vous reconnecter.",
          403: "Accès refusé. Vous n'avez pas la permission.",
          404: "Aucune donnée trouvée.",
          500: "Erreur serveur. Réessayez plus tard."
        }[response.status] || "Erreur inconnue.";
        return { success: false, message };
      }
  
      return { success: true, data: data.data };
  
    } catch (error) {
      console.error("Erreur lors de la récupération du budget :", error);
      return { success: false, message: "Échec de la récupération du budget. Vérifiez votre connexion." };
    }
  };