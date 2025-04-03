// GET: Retrieve Server Theme
export const getServerTheme = async (token) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/theme`, {
        credentials: "include", // Include cookies for authentication
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
  
      if (!response.ok) {
        return "light"; // Default to light theme if no theme is set
      }
  
      const data = await response.json();
      return data.theme || "light"; // Default to light theme if no theme is set
    } catch (error) {
      console.error("Error fetching theme:", error);
      return "light"; // Default to light theme in case of an error
    }
  };
  
  // PUT: Update User's Theme
  export const updateUserTheme = async (id,theme,token) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/theme/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ theme }),
      });
  console.log("response of theme",response)
      if (!response.ok) {
        throw new Error(`Error updating theme: ${response.statusText}`);
      }
  
      const data = await response.json();
      return data.theme;
    } catch (error) {
      console.error("Error updating theme:", error);
      return null;
    }
  };