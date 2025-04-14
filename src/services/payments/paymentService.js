const TRANSACTIONS_API_URL = process.env.NEXT_PUBLIC_API_URL; // Ensure the API URL is set correctly in .env

// Get list of payments
export const getPayments = async (token) => {
  try {
    const response = await fetch(`${TRANSACTIONS_API_URL}/payments`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching payments:", error);
    return { success: false, message: "Failed to fetch payments" };
  }
};

// Get a specific payment by ID
export const getPaymentById = async (paymentId,token) => {
  try {
    const response = await fetch(`${TRANSACTIONS_API_URL}/payments/${paymentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching payment ${paymentId}:`, error);
    return { success: false, message: `Failed to fetch payment ${paymentId}` };
  }
};

// Create a new payment
export const createPayment =  async (paymentData, token) => {
  try {
    const response = await fetch(`${TRANSACTIONS_API_URL}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(paymentData)
    });

    const data = await response.json(); // Parse JSON response

    // Handle response codes
    if (response.status === 400) {
      return { success: false, message: data.message || "Payment validation error" };
    }
    if (response.status === 404) {
      return { success: false, message: "Transaction not found" };
    }
    if (response.status === 500) {
      return { success: false, message: "Server error, please try again later" };
    }
    if (response.ok) {
      return { success: true, payment: data.payment, message: "Payment recorded successfully" };
    }

    return { success: false, message: "Unexpected error occurred" };
  } catch (error) {
    console.error("Error creating payment:", error);
    return { success: false, message: "Failed to create payment. Please check your connection." };
  }
};

// Delete a payment
export const deletePayment = async (paymentId,token) => {
  try {
    const response = await fetch(`${TRANSACTIONS_API_URL}/payments/${paymentId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete payment, status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error("Error deleting payment:", error);
    return false;
  }
};

// Update an existing payment (if you want this functionality)
export const updatePayment = async (paymentId, payment,token) => {
  try {
    const response = await fetch(`${TRANSACTIONS_API_URL}/payments/${paymentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
      payment
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error updating payment ${paymentId}:`, error);
    return { success: false, message: `Failed to update payment ${paymentId}` };
  }
};

// Get payments by transaction ID
export const getPaymentsByTransactionId = async (transaction_id, token) => {
  try {
    const response = await fetch(`${TRANSACTIONS_API_URL}/payments/transactions/${transaction_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }
    });

    const data = await response.json(); // Parse JSON response
    // Handle response codes
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
      return { success: false, message: "No payments found for this transaction" };
    }
    if (response.status === 500) {
      return { success: false, message: "Server error, please try again later" };
    }
    if (response.ok) {
      return { success: true, payments: data.payments };
    }

    return { success: false, message: "Unexpected error occurred" };
  } catch (error) {
    console.error("Error fetching payments:", error);
    return { success: false, message: "Failed to fetch payments. Please check your connection." };
  }
};