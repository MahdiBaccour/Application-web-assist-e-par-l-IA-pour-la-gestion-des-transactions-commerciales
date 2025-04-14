// Fetch the API_URL from the environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.error("API_URL is not defined. Make sure to set NEXT_PUBLIC_API_URL in your .env file.");
}


// Create a new client
export const createClient = async (clientData, token) => {
  try {
    const response = await fetch(`${API_URL}/clients`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(clientData),
    });

    if (!response.ok) throw new Error(`Failed to create client: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error("Error creating client:", error);
    return null;
  }
};

// Fetch all clients
export const getClients = async (status = '', token) => {
  try {
    const url = new URL(`${API_URL}/clients`);
    if (status !== 'all') url.searchParams.append('status', status);
    
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`, // Add authorization header if token is available
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
      return { success: false, message: "No clients found." };
    }
    if (response.status === 500) {
      return { success: false, message: "Server error, please try again later." };
    }
    if (response.ok) {
      return { success: true, clients: data.clients  }; // Return clients if available
    }

    return { success: false, message: "Unexpected error occurred." };
  } catch (error) {
    console.error("Error fetching clients:", error);
    return { success: false, message: "Failed to fetch clients. Please check your connection." };
  }
};

// Fetch a single client by ID
export const getClient = async (id, token) => {
  try {
    const response = await fetch(`${API_URL}/clients/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Add authorization header if token is available
      },
    });

    if (!response.ok) throw new Error(`Failed to fetch client (ID: ${id}): ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching client:", error);
    return null;
  }
};

// Check if a phone number already exists for clients
export const getClientByPhone = async (phone, token) => {
  try {
    const response = await fetch(`${API_URL}/clients/check-phone`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Add authorization header if token is available
      },
      body: JSON.stringify({ phone }),
    });

    const data = await response.json();
    return response.ok && data.success ? data.client : null;
  } catch (error) {
    console.error("Error checking phone number:", error);
    return null;
  }
};

// Update client information
export const updateClient = async (id, updates, token) => {
  try {
    const response = await fetch(`${API_URL}/clients/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Add authorization header if token is available
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) throw new Error(`Failed to update client (ID: ${id}): ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error("Error updating client:", error);
    return null;
  }
};

// Update client status
export const updateClientStatus = async (id, status, token) => {
  try {
    const response = await fetch(`${API_URL}/clients/${id}/status`, {
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Add authorization header if token is available
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) throw new Error(`Failed to update client status (ID: ${id}): ${response.statusText}`);
    return true;
  } catch (error) {
    console.error("Error updating status:", error);
    return false;
  }
};
