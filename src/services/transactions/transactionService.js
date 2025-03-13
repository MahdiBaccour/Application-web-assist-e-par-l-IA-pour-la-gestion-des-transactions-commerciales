export const createTransaction = async (transactionData, token) => {
    try {
      const response = await fetch(`${TRANSACTIONS_API_URL}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
         // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(transactionData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating transaction:', error);
      return null;
    }
  };
  
  export const getTransactions = async (token) => {
    try {
      const response = await fetch(`${TRANSACTIONS_API_URL}/`, {
        method: 'GET',
        headers: {
          //'Authorization': `Bearer ${token}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return null;
    }
  };
  
  export const getTransactionById = async (transactionId, token) => {
    try {
      const response = await fetch(`${TRANSACTIONS_API_URL}/${transactionId}`, {
        method: 'GET',
        headers: {
         // 'Authorization': `Bearer ${token}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error fetching transaction by ID:', error);
      return null;
    }
  };
  
  export const updateTransaction = async (transactionId, transactionData, token) => {
    try {
      const response = await fetch(`${TRANSACTIONS_API_URL}/${transactionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
         // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(transactionData)
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating transaction:', error);
      return null;
    }
  };
  
  export const deleteTransaction = async (transactionId, token) => {
    try {
      const response = await fetch(`${TRANSACTIONS_API_URL}/${transactionId}`, {
        method: 'DELETE',
        headers: {
        //  'Authorization': `Bearer ${token}`
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return null;
    }
  };