export const getNotifications = async (token, page = 1, limit = 10) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/notifications?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        return { success: false, message: data.message || "Failed to fetch notifications" };
      }
  
      return { 
        success: true, 
        notifications: data.notifications,
        total: data.total,
        hasMore: data.hasMore
      };
    } catch (error) {
      throw new Error("Failed to fetch notifications");
    }
  };