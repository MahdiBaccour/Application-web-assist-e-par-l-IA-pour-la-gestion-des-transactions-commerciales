const CATEGORIES_API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getCategories = async (token) => {
  try {
    const response = await fetch(`${CATEGORIES_API_URL}/categories`, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.status === 400) {
      return { success: false, message: "Bad request. Please check your input.",categories: [] };
    }
    if (response.status === 401) {
      return { success: false, message: "Unauthorized access. Please log in again." ,categories: [] };
    }
    if (response.status === 403) {
      return { success: false, message: "Forbidden access. You do not have permission to view this resource.", categories: [] };
    }
    if (response.status === 404) {
      return { success: false, message: "No categories found." ,categories: [] };
    }
    if (response.status === 500) {
      return { success: false, message: "Server error, please try again later.", categories: [] };
    }
    if (response.ok) {
      return { success: true, categories: data.categories }; // Return categories if available
    }

    return { success: false, message: "Unexpected error occurred.", categories: [] };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, message: "Failed to fetch categories. Please check your connection.", categories: [] };
  }
};