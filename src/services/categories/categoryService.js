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
      return { success: false, message: "Bad request. Please check your input.", categories: [] };
    }
    if (response.status === 401) {
      return { success: false, message: "Unauthorized access. Please log in again.", categories: [] };
    }
    if (response.status === 403) {
      return { success: false, message: "Forbidden access. You do not have permission to view this resource.", categories: [] };
    }
    if (response.status === 404) {
      return { success: false, message: "No categories found.", categories: [] };
    }
    if (response.status === 500) {
      return { success: false, message: "Server error, please try again later.", categories: [] };
    }
    if (response.ok) {
      return { success: true, categories: data.categories };
    }

    return { success: false, message: "Unexpected error occurred.", categories: [] };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, message: "Failed to fetch categories. Please check your connection.", categories: [] };
  }
};

export const createCategory = async (category, token) => {
  try {
    const response = await fetch(`${CATEGORIES_API_URL}/categories`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(category),
    });

    const data = await response.json();

    if (response.status === 400) {
      return { success: false, message: "Bad request. Please check your input." };
    }
    if (response.status === 401) {
      return { success: false, message: "Unauthorized access. Please log in again." };
    }
    if (response.status === 403) {
      return { success: false, message: "Forbidden access. You do not have permission to perform this action." };
    }
    if (response.status === 500) {
      return { success: false, message: "Server error, please try again later." };
    }
    if (response.ok) {
      return { success: true, category: data.category };
    }

    return { success: false, message: "Unexpected error occurred." };
  } catch (error) {
    console.error("Error creating category:", error);
    return { success: false, message: "Failed to create category. Please check your connection." };
  }
};

export const updateCategory = async (id, category, token) => {
  try {
    const response = await fetch(`${CATEGORIES_API_URL}/categories/${id}`, {
      method: "PUT",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(category),
    });

    const data = await response.json();

    if (response.status === 400) {
      return { success: false, message: "Bad request. Please check your input." };
    }
    if (response.status === 401) {
      return { success: false, message: "Unauthorized access. Please log in again." };
    }
    if (response.status === 403) {
      return { success: false, message: "Forbidden access. You do not have permission to perform this action." };
    }
    if (response.status === 404) {
      return { success: false, message: "Category not found." };
    }
    if (response.status === 500) {
      return { success: false, message: "Server error, please try again later." };
    }
    if (response.ok) {
      return { success: true, category: data.category };
    }

    return { success: false, message: "Unexpected error occurred." };
  } catch (error) {
    console.error("Error updating category:", error);
    return { success: false, message: "Failed to update category. Please check your connection." };
  }
};

export const updateCategoryStatus = async (id, newStatus, token) => {
  try {
    const response = await fetch(`${CATEGORIES_API_URL}/categories/${id}/status`, {
      method: "PATCH",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    });

    if (response.status === 400) {
      return false;
    }
    if (response.status === 401) {
      return false;
    }
    if (response.status === 403) {
      return false;
    }
    if (response.status === 404) {
      return false;
    }
    if (response.status === 500) {
      return false;
    }

    return response.ok;
  } catch (error) {
    console.error("Error updating category status:", error);
    return false;
  }
};
