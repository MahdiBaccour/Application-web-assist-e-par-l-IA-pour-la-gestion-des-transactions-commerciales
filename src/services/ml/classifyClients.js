let cachedData = null;

export const classifyClients = async () => {
  if (cachedData) return { success: true, data: cachedData };

  try {
    const response = await fetch("http://127.0.0.1:5000/api/classify");
    const json = await response.json();

    if (!response.ok || !json.success) {
      return { success: false, message: json.message || "Erreur lors du traitement." };
    }

    cachedData = json.data;
    return { success: true, data: json.data };
  } catch (error) {
    return { success: false, message: error.message };
  }
};