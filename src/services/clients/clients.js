// services/clients/clients.js

// Fetch the API_URL from the environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.error("API_URL is not defined. Make sure to set NEXT_PUBLIC_API_URL in your .env file.");
}

// Fetch all clients

// services/clients/clients.js

// services/clients/clients.js

// services/clients/clients.js

export const getClients = async () => {
  try {
    const response = await fetch(`${API_URL}/clients`);
    if (!response.ok) throw new Error(`Failed to fetch clients: ${response.statusText}`);
    
    const data = await response.json();
    
    // Log the data to the console
    console.log('Fetched clients:', data); // Verify the structure
    
    // Access the 'clients' property from the response
    return Array.isArray(data.clients) ? data.clients : [];
  } catch (error) {
    console.error("Error fetching clients:", error);
    return []; // Return an empty array in case of error
  }
};




// Fetch a single client by ID
export const getClient = async (id) => {
  try {
    const response = await fetch(`${API_URL}/clients/${id}`);
    if (!response.ok) throw new Error(`Failed to fetch client (ID: ${id}): ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching client:", error);
    return null;
  }
};

// Create a new client
export const createClient = async (clientData) => {
  try {
    const response = await fetch(`${API_URL}/clients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clientData),
    });

    if (!response.ok) throw new Error(`Failed to create client: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error("Error creating client:", error);
    return null;
  }
};

// Update client information
export const updateClient = async (id, updates) => {
  try {
    const response = await fetch(`${API_URL}/clients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!response.ok) throw new Error(`Failed to update client (ID: ${id}): ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error("Error updating client:", error);
    return null;
  }
};

// Delete a client
export const deleteClient = async (id) => {
  try {
    const response = await fetch(`${API_URL}/clients/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error(`Failed to delete client (ID: ${id}): ${response.statusText}`);
    return true;
  } catch (error) {
    console.error("Error deleting client:", error);
    return false;
  }
};

// Export all functions
export default {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
};
