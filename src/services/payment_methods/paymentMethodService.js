export const PAYMENT_METHODS_API_URL = process.env.NEXT_PUBLIC_API_URL+"/payment_methods";

export const getPaymentMethods = async (token) => {
  try {
    const response = await fetch(PAYMENT_METHODS_API_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || "Failed to fetch payment methods");
    }

    return {
      success: true,
      methods: data.methods
    };
  } catch (error) {
    console.error("Payment Method Service Error:", error);
    return {
      success: false,
      message: error.message
    };
  }
};