const PRODUCTS_API_URL = process.env.PRODUCTS_API_URL;

export const createProduct = async (productData, token) => {
  try {
    const response = await fetch(`${PRODUCTS_API_URL}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
       // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(productData)
    });
    return await response.json();
  } catch (error) {
    console.error('Error creating product:', error);
    return null;
  }
};

export const fetchProducts = async (token) => {
  try {
    const response = await fetch(`${PRODUCTS_API_URL}/`, {
      method: 'GET',
      headers: {
      //  'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return null;
  }
};

export const fetchProductById = async (id, token) => {
  try {
    const response = await fetch(`${PRODUCTS_API_URL}/${id}`, {
      method: 'GET',
      headers: {
       // 'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

export const updateProduct = async (id, updateData, token) => {
  try {
    const response = await fetch(`${PRODUCTS_API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      //  'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  }
};

export const deactivateProduct = async (id, token) => {
  try {
    const response = await fetch(`${PRODUCTS_API_URL}/${id}`, {
      method: 'DELETE',
      headers: {
       // 'Authorization': `Bearer ${token}`
      }
    });
    return await response.json();
  } catch (error) {
    console.error('Error deactivating product:', error);
    return null;
  }
};