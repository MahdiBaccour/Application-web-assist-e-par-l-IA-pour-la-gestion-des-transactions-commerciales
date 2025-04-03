const PRODUCTS_API_URL = process.env.NEXT_PUBLIC_API_URL;

export const createProduct = async (productData,token) => {
  try {
    const response = await fetch(`${PRODUCTS_API_URL}/products/`, {
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

export const getProducts = async (categoryId = null, status = "all",token) => {
  try {
    const url = new URL(`${PRODUCTS_API_URL}/products`);

    if (categoryId) url.searchParams.append("category_id", categoryId);
    if (status !== "all") url.searchParams.append("status", status);

    const response = await fetch(url.toString(), { method: "GET" ,headers:
      {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Add authorization header if token is available
      }
    });
    const res = await response.json(); 
    return res.products || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
};

export const getProductById = async (id,token) => {
  try {
    const response = await fetch(`${PRODUCTS_API_URL}/products/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
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
