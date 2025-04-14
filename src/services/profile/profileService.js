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
  
      
    const data = await response.json();

    if (response.status === 401) {
      return { success: false, message: "Unauthorized access" };
    }
    if (response.status === 500) {
      return { success: false, message: "Server error" };
    }
    if (response.ok) {
      return { success: true, notifications: data.notifications };
    }

    return { success: false, message: "Unexpected error" };
  } catch (error) {
    return { success: false, message: "Connection error" };
  }
}