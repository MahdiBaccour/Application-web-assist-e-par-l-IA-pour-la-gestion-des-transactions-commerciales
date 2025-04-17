const PRODUCTS_API_URL = process.env.NEXT_PUBLIC_API_URL;

export const createProduct = async (productData,token) => {
  try {
    const response = await fetch(`${PRODUCTS_API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' ,
        'Authorization': `Bearer ${token}` // Add authorization header if token is available
        
      },
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create product');
    }

    return await response.json(); // Should return the full product object with ID
  } catch (error) {
    console.error('Create product error:', error);
    throw error;
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
