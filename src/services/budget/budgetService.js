const BUDGET_API_URL = `${process.env.NEXT_PUBLIC_API_URL}/total_budget`;

export const createBudget = async (data, token) => {
  try {
    const response = await fetch(`${BUDGET_API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.status === 400) {
      return { success: false, message: "Requête invalide. Vérifiez vos données." };
    }
    if (response.status === 401) {
      return { success: false, message: "Accès non autorisé. Veuillez vous reconnecter." };
    }
    if (response.status === 403) {
      return { success: false, message: "Accès refusé. Vous n'avez pas la permission." };
    }
    if (response.status === 409) {
      return { success: false, message: "L'entrée du budget existe déjà pour ce mois." };
    }
    if (response.status === 500) {
      return { success: false, message: "Erreur serveur lors de l'ajout du budget." };
    }

    if (response.ok) {
      return { success: true, budget: result.budget };
    }

    return { success: false, message: result.message || "Erreur inattendue." };

  } catch (error) {
    return { success: false, message: "Échec de l'ajout. Vérifiez votre connexion." };
  }
};

export const getBudgets = async (token) => {
  try {
    const response = await fetch(`${BUDGET_API_URL}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();

    if (response.status === 401) {
      return { success: false, message: "Non autorisé. Veuillez vous connecter." };
    }
    if (response.status === 403) {
      return { success: false, message: "Vous n'avez pas accès à ces données." };
    }
    if (response.status === 404) {
      return { success: false, message: "Aucun budget trouvé." };
    }
    if (response.status === 500) {
      return { success: false, message: "Erreur serveur." };
    }

    if (response.ok) {
      return { success: true, budgets: result.budgets };
    }

    return { success: false, message: result.message || "Erreur inattendue." };
  } catch (error) {
    return { success: false, message: "Erreur réseau ou serveur inaccessible." };
  }
};

export const updateBudget = async (id, data, token) => {
  try {
    const response = await fetch(`${BUDGET_API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.status === 400) {
      return { success: false, message: "Données incorrectes pour la mise à jour." };
    }
    if (response.status === 401) {
      return { success: false, message: "Non autorisé à modifier le budget." };
    }
    if (response.status === 404) {
      return { success: false, message: "Budget introuvable." };
    }
    if (response.status === 500) {
      return { success: false, message: "Erreur serveur lors de la mise à jour." };
    }

    if (response.ok) {
      return { success: true, budget: result.budget };
    }

    return { success: false, message: result.message || "Erreur inconnue." };
  } catch (error) {
    return { success: false, message: "Erreur de connexion ou serveur." };
  }
};

