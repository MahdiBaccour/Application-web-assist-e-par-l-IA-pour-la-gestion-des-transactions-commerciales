export const updateProfile = async (profileData, token) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // 🔹 Use token-based authentication
        },
        body: JSON.stringify(profileData),
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
  
      return await response.json();
    } catch (error) {
      throw new Error(error.message);
    }
  };