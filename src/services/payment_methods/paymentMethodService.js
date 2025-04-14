export const PAYMENT_METHODS_API_URL = process.env.NEXT_PUBLIC_API_URL+"/payment_methods";

export const getPaymentMethods = async (token) => {
  try {
    const response = await fetch(PAYMENT_METHODS_API_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();
    console.log("Payment Methods Response:", data);

    // Handle response status codes
    if (response.status === 400) {
      return { success: false, message: "Bad request. Please check your input." };
    }
    if (response.status === 401) {
      return { success: false, message: "Unauthorized access. Please log in again." };
    }
    if (response.status === 403) {
      return { success: false, message: "Forbidden. You don’t have permission to access this resource." };
    }
    if (response.status === 404) {
      return { success: false, message: "No payment methods found." };
    }
    if (response.status === 500) {
      return { success: false, message: "Server error. Please try again later." };
    }

    if (response.ok && data.success) {
      return { success: true, methods: data.methods };
    }

    return { success: false, message: data.message || "Unexpected error occurred." };
  } catch (error) {
    console.error("Error fetching payment methods:", error);
    return {
      success: false,
      message: "Failed to fetch payment methods. Please check your connection."
    };
  }
};