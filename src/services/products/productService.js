const PRODUCTS_API_URL = process.env.NEXT_PUBLIC_API_URL;

export const createProduct = async (productData, token) => {
  try {
    const response = await fetch(`${PRODUCTS_API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });

    const data = await response.json();

    // Handle common status cases
    if (response.status === 400) {
      return { success: false, message: "Mauvaise requête. Veuillez vérifier les champs." };
    }
    if (response.status === 401) {
      return { success: false, message: "Non autorisé. Veuillez vous reconnecter." };
    }
    if (response.status === 403) {
      return { success: false, message: "Accès interdit. Vous n'avez pas la permission." };
    }
    if (response.status === 404) {
      return { success: false, message: "Ressource non trouvée." };
    }
    if (response.status === 500) {
      return { success: false, message: "Erreur du serveur. Réessayez plus tard." };
    }

    // Success
    if (response.ok) {
      return {
        success: true,
        product: data.product, // expect: { id, name, ... }
        message: data.message || "Produit créé avec succès.",
      };
    }

    // Fallback
    return { success: false, message: "Une erreur inattendue est survenue." };

  } catch (error) {
    console.error("Erreur lors de la création du produit:", error);
    return {
      success: false,
      message: "Erreur de connexion ou serveur. Veuillez vérifier votre réseau.",
    };
  }
};

export const getProducts = async (categoryId = null, status = "all", token) => {
  try {
    const url = new URL(`${PRODUCTS_API_URL}/products`);
    if (categoryId) url.searchParams.append("category_id", categoryId);
    if (status !== "all") url.searchParams.append("status", status);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`, // Add authorization header if token is available
      },
    });

    const data = await response.json();

    if (response.status === 400) {
      return { success: false, message: "Bad request. Please check your input." };
    }
    if (response.status === 401) {
      return { success: false, message: "Unauthorized access. Please log in again." };
    }
    if (response.status === 403) {
      return { success: false, message: "Forbidden access. You do not have permission to view this resource." };
    }
    if (response.status === 404) {
      return { success: false, message: "No products found." };
    }
    if (response.status === 500) {
      return { success: false, message: "Server error, please try again later." };
    }
    if (response.ok) {
      return { success: true, products: data.products }; // Return products if available
    }

    return { success: false, message: "Unexpected error occurred." };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { success: false, message: "Failed to fetch products. Please check your connection." };
  }
};

export const getProductById = async (id, token) => {
  try {
    const response = await fetch(`${PRODUCTS_API_URL}/products/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (response.status === 400) {
      return { success: false, message: "Bad request. Please check your input." };
    }
    if (response.status === 401) {
      return { success: false, message: "Unauthorized access. Please log in again." };
    }
    if (response.status === 403) {
      return { success: false, message: "Forbidden access. You do not have permission to view this resource." };
    }
    if (response.status === 404) {
      return { success: false, message: "Product not found." };
    }
    if (response.status === 500) {
      return { success: false, message: "Server error, please try again later." };
    }
    if (response.ok) {
      return { success: true, product: data.product }; // Return the product if available
    }

    return { success: false, message: "Unexpected error occurred." };
  } catch (error) {
    console.error("Error fetching product:", error);
    return { success: false, message: "Failed to fetch product. Please check your connection." };
  }
};

export const updateProduct = async (id, updateData,token) => {
  try {
    const response = await fetch(`${PRODUCTS_API_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
       'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });
    return await response.json();;
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  }
};

export const updateProductStatus = async (id, status_product,token) => {
  try {
    const response = await fetch(`${PRODUCTS_API_URL}/products/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Add authorization header if token is available
      },
      body: JSON.stringify({ status_product }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error updating product status:", errorData);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating product status:", error);
    return null;
  }
};
