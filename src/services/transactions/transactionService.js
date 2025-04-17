
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  console.error("API_URL is not defined. Make sure to set NEXT_PUBLIC_API_URL in your .env file.");
}
const TRANSACTIONS_API_URL = `${API_URL}/transactions`;
export const createTransaction = async (transactionData, token) => {
  try {
    const response = await fetch(`${TRANSACTIONS_API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(transactionData)
    });

    const data = await response.json();
    console.log("Create Transaction Response:", data);

    // Handle known response status codes
    if (response.status === 400) {
      return { success: false, message: data.message || "Bad request. Please check your input." };
    }
    if (response.status === 401) {
      return { success: false, message: "Unauthorized access. Please log in again." };
    }
    if (response.status === 403) {
      return { success: false, message: "Forbidden access. You don't have permission to perform this action." };
    }
    if (response.status === 404) {
      return { success: false, message: data.message || "Resource not found." };
    }
    if (response.status === 409) {
      return { success: false, message: data.message || "Duplicate or conflicting data." };
    }
    if (response.status === 500) {
      return { success: false, message: "Server error. Please try again later." };
    }

    if (response.ok) {
      return {
        success: true,
        message: "Transaction created successfully.",
        transaction: data.transaction
      };
    }

    // Catch-all for unexpected responses
    return { success: false, message: "Unexpected error occurred." };
  } catch (error) {
    console.error("Error creating transaction:", error);
    return { success: false, message: "Failed to create transaction. Please check your connection." };
  }
};
  
  export const getTransactions = async (type = "all",token) => {
    try {
      const url = new URL(TRANSACTIONS_API_URL);
      if (type !== "all") url.searchParams.append("type", type);
  
      const response = await fetch(url
      ,{
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
      );
       if (!response.ok) throw new Error(`Failed to fetch transactions: ${response.statusText}`);
  
      const data = await response.json();
      return data.transactions || [];
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
  };
  
  export const getTransactionById = async (transactionId,token) => {
    try {
      const response = await fetch(`${TRANSACTIONS_API_URL}/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching transaction by ID:', error);
      return null;
    }
  };
  
  export const getActiveTransactionsByType = async (type, token) => {
    try {
      // Validate type before making the request
      if (!type || !['credit', 'debit'].includes(type.toLowerCase())) {
        throw new Error("Invalid transaction type. Use 'credit' or 'debit'");
      }
  
      const response = await fetch(
        `${TRANSACTIONS_API_URL}/active?type=${encodeURIComponent(type)}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch transactions");
      }
  
      return {
        success: true,
        count: data.count,
        transactions: data.transactions
      };
    } catch (error) {
      console.error("Transaction Service Error:", error);
      return {
        success: false,
        message: error.message
      };
    }
  };
  
  export const updateTransaction = async (transactionId, transactionData,token) => {
    try {
      const response = await fetch(`${TRANSACTIONS_API_URL}/${transactionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
         'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(transactionData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating transaction:', error);
      return null;
    }
  };
  
  export const deleteTransaction = async (transactionId,token) => {
    try {
      const response = await fetch(`${TRANSACTIONS_API_URL}/${transactionId}`, {
        method: 'DELETE',
        headers: {
         'Authorization': `Bearer ${token}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return null;
    }
  };
  