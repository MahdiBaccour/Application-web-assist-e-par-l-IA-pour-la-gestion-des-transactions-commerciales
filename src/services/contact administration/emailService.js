const CONTACTADMIN_API_URL = process.env.NEXT_PUBLIC_API_URL; // Ensure the API URL is set correctly in .env

export const sendEmailToAdmin = async (formData, token) => {
  try {
    const response = await fetch(`${CONTACTADMIN_API_URL}/contact-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        fullName: formData.fullName, // Structure modifiée ici
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        problem: formData.problem
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Échec de l\'envoi');
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Erreur d'envoi : ${error.message}`);
  }
};