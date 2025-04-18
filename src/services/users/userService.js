// Fetch the API_URL from the environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.error("API_URL is not defined. Make sure to set NEXT_PUBLIC_API_URL in your .env file.");
}

// Create a new user
export const createUser = async (userData, token) => {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (response.status === 409) {
      return { success: false, message: data.message || "Conflit : utilisateur déjà existant." };
    }

    if (!response.ok) {
      return { success: false, message: data.message || "Échec de la création de l'utilisateur." };
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, message: "Erreur de connexion au serveur." };
  }
};

// Fetch all users
export const getUsers = async (status = '', token) => {
  try {
    const url = new URL(`${API_URL}/users`);
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
      return { success: false, message: "No users found." };
    }
    if (response.status === 500) {
      return { success: false, message: "Server error, please try again later." };
    }
    if (response.ok) {
      return { success: true, users: data.users }; // Return users if available
    }

    return { success: false, message: "Unexpected error occurred." };
  } catch (error) {
    console.error("Error fetching users:", error);
    return { success: false, message: "Failed to fetch users. Please check your connection." };
  }
};

// Fetch a single user by ID
export const getUser = async (id, token) => {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Add authorization header if token is available
      },
    });

    if (!response.ok) throw new Error(`Failed to fetch user (ID: ${id}): ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

// Update user information
export const updateUser = async (id, updates, token) => {
  try {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Add authorization header if token is available
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) throw new Error(`Failed to update user (ID: ${id}): ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
};

// Update user status
export const updateUserStatus = async (id, status, token) => {
    try {
      const response = await fetch(`${API_URL}/users/${id}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ verified_status: status }),
      });
  
      if (!response.ok) throw new Error(`Failed to update user status (ID: ${id}): ${response.statusText}`);
      return true;
    } catch (error) {
      console.error("Error updating status:", error);
      return false;
    }
  };
  