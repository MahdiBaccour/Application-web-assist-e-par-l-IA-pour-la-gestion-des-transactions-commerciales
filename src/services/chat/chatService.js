// services/chatService.js

const CHAT_API_URL = process.env.NEXT_PUBLIC_API_URL; // ex: http://localhost:3001

/**
 * Envoie un message à l’API Chat et retourne la réponse du bot.
 * @param {string} message - Le texte envoyé par l'utilisateur.
 * @param {string} token   - Le token JWT.
 * @returns {Promise<{success: boolean, reply?: string, message?: string}>}
 */
export const sendMessage = async (message, token) => {
  try {
    const response = await fetch(`${CHAT_API_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });

    // Lecture du JSON
    const data = await response.json();

    // Gestion des codes d'erreur courants
    if (response.status === 400) {
      return { success: false, message: "Requête invalide. Veuillez vérifier votre message." };
    }
    if (response.status === 401) {
      return { success: false, message: "Non autorisé. Veuillez vous reconnecter." };
    }
    if (response.status === 403) {
      return { success: false, message: data.reply || "Accès interdit. Question hors sujet." };
    }
    if (response.status === 404) {
      return { success: false, message: "Ressource non trouvée." };
    }
    if (response.status === 500) {
      return { success: false, message: "Erreur serveur. Réessayez plus tard." };
    }

    // Succès
    if (response.ok) {
      return {
        success: true,
        reply: data.reply,
      };
    }

    // Cas inattendu
    return { success: false, message: "Erreur inattendue lors de l’envoi du message." };

  } catch (error) {
    console.error("Erreur connexion Chat API :", error);
    return {
      success: false,
      message: "Impossible de contacter le serveur. Vérifiez votre réseau.",
    };
  }
};