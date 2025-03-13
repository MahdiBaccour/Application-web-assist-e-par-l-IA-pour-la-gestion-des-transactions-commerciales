// services/suppliers/suppliers.js

// Fetch the API_URL from the environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.error("API_URL is not defined. Make sure to set NEXT_PUBLIC_API_URL in your .env file.");
}

// services/suppliers/suppliers.js



export const createSupplier = async (supplierData) => {
  try {
    const response = await fetch(`${API_URL}/suppliers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(supplierData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response text:", errorText);
      throw new Error(`Failed to create supplier: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating supplier:", error);
    return null;
  }
};









// 📌 Get all suppliers
export const getSuppliers = async () => {
  try {
    const response = await fetch(`${API_URL}/suppliers`);
    if (!response.ok) throw new Error(`Failed to fetch suppliers: ${response.statusText}`);
    const data = await response.json();
    return data.suppliers || [];
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return [];
  }
};

// 📌 Get a single supplier by ID
export const getSupplier = async (id) => {
  try {
    const response = await fetch(`${API_URL}/suppliers/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch supplier (ID: ${id}): ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching supplier:", error);
    return null;
  }
};

// 📌 Update a supplier by ID
export const updateSupplier = async (id, supplierData) => {
  try {
    const response = await fetch(`${API_URL}/suppliers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(supplierData),
    });

    if (!response.ok) throw new Error(`Failed to update supplier (ID: ${id}): ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error("Error updating supplier:", error);
    return null;
  }
};

// 📌 Delete a supplier by ID
export const deleteSupplier = async (id) => {
  try {
    const response = await fetch(`${API_URL}/suppliers/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error(`Failed to delete supplier (ID: ${id}): ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return null;
  }
};

export default {
  createSupplier,
  getSuppliers,
  getSupplier,
  updateSupplier,
  deleteSupplier,
};
