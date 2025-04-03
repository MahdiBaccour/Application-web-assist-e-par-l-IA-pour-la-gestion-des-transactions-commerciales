

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.error("API_URL is not defined. Make sure to set NEXT_PUBLIC_API_URL in your .env file.");
}
export const getTransactionProducts = async (transactionId,token) => {
    try {
      const response = await fetch(`${API_URL}/transaction_products/${transactionId}/products`
      ,{
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
      );
      if (!response.ok) throw new Error("Failed to fetch transaction products");
      return await response.json();
    } catch (error) {
      console.error("Error fetching transaction products:", error);
      return { transactionProducts: [] }; // Return empty array if error
    }
  };

  export const getHistoricalCosts = async (productId,token) => {
    try {
      const response = await fetch(`${API_URL}/transaction_products/${productId}/historical-costs`
      ,{
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
      
      );
      return await response.json();
    } catch (error) {
      console.error("Error fetching historical cost prices:", error);
      return null;
    }
  };
