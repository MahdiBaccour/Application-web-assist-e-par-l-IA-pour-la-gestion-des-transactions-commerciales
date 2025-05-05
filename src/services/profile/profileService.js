export const updateProfile = async (profileData, token) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    const data = await response.json();

    if (!response.ok) {
      switch (response.status) {
        case 400:
          return { success: false, message: data.message || "Requête invalide. Vérifiez les champs saisis." };
        case 401:
          return { success: false, message: data.message || "Accès non autorisé. Veuillez vous reconnecter." };
        case 403:
          return { success: false, message: data.message || "Action interdite." };
        case 404:
          return { success: false, message: data.message || "Utilisateur non trouvé." };
        case 429:
          return { success: false, message: data.message || "Trop de requêtes. Veuillez patienter." };
        case 500:
          return { success: false, message: data.message || "Erreur de serveur. Veuillez réessayer plus tard." };
        default:
          return { success: false, message: data.message || "Une erreur inconnue s'est produite." };
      }
    }

    return { success: true, user: data.user, message: data.message || "Profil mis à jour avec succès." };

  } catch (error) {
    console.error("❌ Erreur API updateProfile:", error);
    return { success: false, message: "Erreur de connexion au serveur." };
  }
};

export const getCurrentUserProfile = async (token) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (res.status === 401) return { success: false, message: "Non autorisé. Veuillez vous reconnecter." };
    if (res.status === 500) return { success: false, message: "Erreur serveur." };
    if (!data.success) return { success: false, message: data.message };

    return { success: true, user: data.user };
  } catch (error) {
    return { success: false, message: "Échec de la connexion au serveur." };
  }
};