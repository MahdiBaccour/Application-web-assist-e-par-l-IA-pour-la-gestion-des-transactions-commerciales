// components/ThemeProvider.jsx
"use client";
import { createContext, useContext, useState, useEffect, startTransition } from "react";
import { useSession } from "next-auth/react";
import { updateUserTheme } from "@/services/settings/themeService";

const ThemeContext = createContext({
  theme: "light",
  setTheme: (theme) => {},
});

export function ThemeProvider({ children, serverTheme }) {
  const { data: session } = useSession();
  const [theme, setThemeState] = useState("light");

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const systemTheme = mediaQuery.matches ? "dark" : "light";
    const initialTheme = serverTheme || session?.user?.theme || systemTheme;
    
    setThemeState(initialTheme);
    document.documentElement.setAttribute("data-theme", initialTheme);
  }, [serverTheme, session?.user?.theme]);

  const setTheme = async (newTheme) => {
    startTransition(() => {
      setThemeState(newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
    });

    if (session?.user?.id) {
      try {
        await updateUserTheme(session.user.id, newTheme);
      } catch (error) {
        console.error("Failed to update theme:", error);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);