// Fetch the API_URL from the environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.error("API_URL is not defined. Make sure to set NEXT_PUBLIC_API_URL in your .env file.");
}

// 📌 Create a new supplier
export const createSupplier = async (supplierData,token) => {
  try {
    const response = await fetch(`${API_URL}/suppliers`, {
      method: "POST",
      headers: { "Content-Type": "application/json",
      Authorization : `Bearer ${token}`
      },
      body: JSON.stringify(supplierData),
    });

    const responseData = await response.json(); // Parse JSON response

    if (!response.ok) {
      console.error("Error response from API:", responseData);
      return { error: responseData.message || "Failed to create supplier" }; // Return error object
    }

    return responseData;
  } catch (error) {
    console.error("Error creating supplier:", error.message);
    return { error: "An unexpected error occurred. Please try again." }; // Return friendly error message
  }
};

// 📌 Get all suppliers
export const getSuppliers = async (status = '', token) => {
  try {
    const url = new URL(`${API_URL}/suppliers`);
    if (status !== 'all') url.searchParams.append('status', status);
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();
    console.log("Suppliers response:", data);

    // Handle response status codes
    if (response.status === 401) {
      return { success: false, message: "Unauthorized access. Please log in again." };
    }
    if (response.status === 403) {
      return { success: false, message: "Forbidden access. You do not have permission to view this resource." };
    }
    if (response.status === 400) {
      return { success: false, message: "Bad request. Please check your input." };
    }
    if (response.status === 404) {
      return { success: false, message: "No suppliers found." };
    }
    if (response.status === 500) {
      return { success: false, message: "Server error, please try again later." };
    }
    if (response.ok) {
      return { success: true, suppliers: data.suppliers };
    }

    return { success: false, message: "Unexpected error occurred." };
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return { success: false, message: "Failed to fetch suppliers. Please check your connection." };
  }
};

// 📌 Get a single supplier by ID
export const getSupplier = async (id,token) => {
  try {
    const response = await fetch(`${API_URL}/suppliers/${id}`
    ,{
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    );
    if (!response.ok) throw new Error(`Failed to fetch supplier (ID: ${id}): ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching supplier:", error);
    return null;
  }
};

// 📌 Check if a phone number already exists
export const getSupplierByPhone = async (phone,token) => {
  try {
    const response = await fetch(`${API_URL}/suppliers/check-phone`, {
      method: "POST",
      headers: { "Content-Type": "application/json",
      Authorization : `Bearer ${token}`
       },
      body: JSON.stringify({ phone }),
    });

    const data = await response.json();
    return response.ok && data.success ? data.supplier : null;
  } catch (error) {
    console.error("Error checking phone number:", error);
    return null;
  }
};

// 📌 Update a supplier by ID
export const updateSupplier = async (id, supplierData,token) => {
  try {
    const response = await fetch(`${API_URL}/suppliers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" ,
      Authorization : `Bearer ${token}`
      },
      body: JSON.stringify(supplierData),
    });
    if (!response.ok) throw new Error(`Failed to update supplier (ID: ${id}): ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error("Error updating supplier:", error);
    return null;
  }
};

// 📌 Update  a supplier status by ID
export const updateSupplierStatus = async (id, status_supplier,token) => {
  try {
    const response = await fetch(`${API_URL}/suppliers/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json',
      Authorization : `Bearer ${token}`
       },
      body: JSON.stringify({ status_supplier })
    });
    return response.ok;
  } catch (error) {
    console.error("Error updating status:", error);
    return false;
  }
};

