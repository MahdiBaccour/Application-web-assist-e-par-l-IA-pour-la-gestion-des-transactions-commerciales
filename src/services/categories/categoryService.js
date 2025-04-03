const CATEGORIES_API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getCategories = async (token) => {
  try {
    const response = await fetch(`${CATEGORIES_API_URL}/categories`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });

    const data = await response.json();
    return data.categories || []; // Ensure it always returns an array
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
};
