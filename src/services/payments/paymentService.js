const TRANSACTIONS_API_URL = process.env.NEXT_PUBLIC_API_URL; // Ensure the API URL is set correctly in .env

// Get list of payments
export const getPayments = async () => {
  try {
    const response = await fetch(`${TRANSACTIONS_API_URL}/payments`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
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
export const getPaymentById = async (paymentId) => {
  try {
    const response = await fetch(`${TRANSACTIONS_API_URL}/payments/${paymentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
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
export const createPayment = async (transaction_id, amount_paid, payment_method_id) => {
  try {
    const response = await fetch(`${TRANSACTIONS_API_URL}/payments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transaction_id,
        amount_paid,
        payment_method_id
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating payment:", error);
    return { success: false, message: "Failed to create payment" };
  }
};

// Delete a payment
export const deletePayment = async (paymentId) => {
  try {
    const response = await fetch(`${TRANSACTIONS_API_URL}/payments/${paymentId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
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
export const updatePayment = async (paymentId, transaction_id, amount_paid, payment_method_id) => {
  try {
    const response = await fetch(`${TRANSACTIONS_API_URL}/payments/${paymentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transaction_id,
        amount_paid,
        payment_method_id
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
