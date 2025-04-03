// components/Navbar.jsx
"use client";
import { useTheme } from "./ThemeProvider";
import { FiSun, FiMoon } from "react-icons/fi";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  // Define text color based on the selected theme
  const getTextColor = (currentTheme) => {
    const lightThemes = ["light", "cupcake", "valentine"];
    return lightThemes.includes(currentTheme) ? "text-gray-900" : "text-white";
  };

  return (
    <nav className={`sticky top-0 z-50 ${theme === 'dark' || theme === 'night' || theme === 'abyss' || theme === 'synthwave' ? 'bg-gray-900' : 'bg-white'} shadow-lg`}>
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className={`text-xl font-bold ${getTextColor(theme)}`}>
              SupplyChain Pro
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-full ${getTextColor(theme)} hover:bg-opacity-50`}
            >
              {theme === 'dark' ? <FiSun size={24} /> : <FiMoon size={24} />}
            </button>
            
            {/* Language Dropdown */}
            <div className="dropdown dropdown-end">
              <button className={`btn ${getTextColor(theme)} ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                {i18n.language.toUpperCase()}
              </button>
              <ul className={`dropdown-content menu p-2 shadow rounded-box w-32 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                <li><button className={getTextColor(theme)} onClick={() => changeLanguage('en')}>English</button></li>
                <li><button className={getTextColor(theme)} onClick={() => changeLanguage('fr')}>Français</button></li>
                <li><button className={getTextColor(theme)} onClick={() => changeLanguage('de')}>Deutsch</button></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}