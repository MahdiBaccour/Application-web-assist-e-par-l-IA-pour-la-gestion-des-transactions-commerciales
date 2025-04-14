

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.error("API_URL is not defined. Make sure to set NEXT_PUBLIC_API_URL in your .env file.");
}

export const getTransactionProducts = async (transactionId, token) => {
  try {
    const response = await fetch(`${API_URL}/transaction_products/${transactionId}/products`, {
      headers: {
        Authorization: `Bearer ${token}`,
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
      return { success: false, message: "No transaction products found." };
    }
    if (response.status === 500) {
      return { success: false, message: "Server error, please try again later." };
    }
    if (response.ok) {
      return { success: true, transactionProducts: data.transactionProducts };
    }

    return { success: false, message: "Unexpected error occurred." };
  } catch (error) {
    console.error("Error fetching transaction products:", error);
    return { success: false, message: "Failed to fetch transaction products. Please check your connection." };
  }
};

export const getHistoricalCosts = async (productId, token) => {
  try {
    const response = await fetch(`${API_URL}/transaction_products/${productId}/historical-costs`, {
      headers: {
        Authorization: `Bearer ${token}`,
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
      return { success: true, message: "No historical cost prices found for this product." };
    }
    if (response.status === 500) {
      return { success: false, message: "Server error, please try again later." };
    }
    if (response.ok) {
      return { success: true, historicalCosts: data.historical_costs };
    }

    return { success: false, message: "Unexpected error occurred." };
  } catch (error) {
    console.error("Error fetching historical cost prices:", error);
    return { success: false, message: "Failed to fetch historical cost prices. Please check your connection." };
  }
};