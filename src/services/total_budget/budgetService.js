// API Service Functions
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getBudgets = async (token) => {
  try {
    const response = await fetch(`${API_URL}/total_budget`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.status === 401) {
      return { success: false, message: "Non autorisé. Veuillez vous reconnecter." };
    }
    if (response.status === 403) {
      return { success: false, message: "Accès interdit. Permissions insuffisantes." };
    }
    if (response.ok) {
      return { success: true, budgets: data.budgets };
    }

    return { success: false, message: "Erreur serveur. Réessayez plus tard." };
  } catch (error) {
    console.error("Erreur lors de la récupération des budgets:", error);
    return { success: false, message: "Échec de la récupération des budgets." };
  }
};

export const createBudget = async (budgetData, token) => {
  try {
    const response = await fetch(`${API_URL}/total_budget`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(budgetData),
    });

    return handleBudgetResponse(response);
  } catch (error) {
    console.error("Erreur lors de la création du budget:", error);
    return { success: false, message: "Échec de la création du budget." };
  }
};

export const updateBudget = async (id, budgetData, token) => {
  try {
    const response = await fetch(`${API_URL}/total_budget/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(budgetData),
    });

    return handleBudgetResponse(response);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du budget:", error);
    return { success: false, message: "Échec de la mise à jour du budget." };
  }
};

const handleBudgetResponse = async (response) => {
  const data = await response.json();

  if (response.status === 400) {
    return { success: false, message: "Données invalides. Veuillez vérifier les informations." };
  }
  if (response.status === 401) {
    return { success: false, message: "Non autorisé. Veuillez vous reconnecter." };
  }
  if (response.status === 403) {
    return { success: false, message: "Accès interdit. Permissions insuffisantes." };
  }
  if (response.ok) {
    return { success: true, budget: data.budget };
  }

  return { success: false, message: "Erreur serveur. Réessayez plus tard." };
};