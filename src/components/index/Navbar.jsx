"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSession, signOut } from "next-auth/react";
import {
  FiUser, FiEdit, FiBookOpen, FiMenu, FiShield, FiUsers, FiPackage, FiLayout,
  FiFileText, FiCode, FiMail, FiLogOut, FiHome
} from "react-icons/fi";
import { pageTitles } from '@/utils/pageTitles';
import { showErrorAlert, showSuccessAlert } from "@/utils/swalConfig";
import { logoutUser } from "@/services/users/userService";


export default function Navbar() {
  const themes = ["light", "dark", "cupcake", "bumblebee", "emerald", "corporate", "synthwave", "retro", "cyberpunk", "valentine", "halloween", "garden", "forest", "aqua", "lofi", "pastel", "fantasy", "wireframe", "black", "luxury", "dracula", "cmyk", "autumn", "business", "acid", "lemonade", "night", "coffee", "winter"];
  const [currentTheme, setCurrentTheme] = useState("light");
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkSession = async () => {
      const sessionData = await getSession();
      setSession(sessionData);
      setLoading(false);
    };
    const savedTheme = localStorage.getItem("theme") || "light";
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
    checkSession();
  }, []);

  const handleNavigation = (path) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setCurrentTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  
    const checkSession = async () => {
      const sessionData = await getSession();
      setSession(sessionData);
      setLoading(false);
    };
    checkSession();
  
    // Set dynamic page title
    const title = pageTitles[pathname] || "SupplyChain Pro";
    document.title = `${title} | SupplyChain Pro`;
  }, [pathname]);
  
  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    window.dispatchEvent(new Event("themeChange"));
  };

const handleLogout = async () => {
  try {
    if (session?.user?.accessToken) {
      const result = await logoutUser(session.user.accessToken);

      if (!result.success) {
        showErrorAlert(
          session.user.theme || "light",
          result.message || "Erreur lors de la déconnexion côté serveur."
        );
      } else {
        showSuccessAlert(
          session.user.theme || "light",
          "Déconnexion enregistrée avec succès."
        );
      }
    }

    // Clear client-side session and redirect
    await signOut({ redirect: false });
    setSession(null); // if you're manually managing session
    setShowLogoutModal(false); // hide modal
    router.push("/");
  } catch (error) {
    showErrorAlert(
      session?.user?.theme || "light",
      "Erreur inattendue lors de la déconnexion."
    );
    console.error("Logout error:", error);
  }
};

  const navItem = (label, path, icon) => (
    <button
      onClick={() => handleNavigation(path)}
      className={`flex items-center gap-2 px-4 py-2 rounded hover:bg-base-200 transition-colors ${pathname === path ? "bg-base-300 font-bold" : ""}`}
    >
      {icon} {label}
    </button>
  );

  if (loading) return null;

  return (
    <nav className="sticky top-0 z-50 shadow-lg" data-theme={currentTheme}>
      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="modal modal-open z-[100]">
          <div className="modal-box">
            <h3 className="text-lg font-bold">Confirmer la déconnexion</h3>
            <p className="py-4">Etes-vous sûr de vouloir vous déconnecter ?</p>
            <div className="modal-action">
              <button className="btn btn-error" onClick={handleLogout}>Déconnexion</button>
              <button className="btn btn-ghost" onClick={() => setShowLogoutModal(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 py-3 bg-base-100">
        <div className="flex items-center justify-between flex-wrap">
          {/* Left - Logo & Home button */}
          <div className="flex items-center gap-4 flex-1 min-w-[240px]">
            <button onClick={() => handleNavigation("/")} className="flex items-center gap-2">
              <FiPackage className="w-7 h-7 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                SupplyChain Pro
              </span>
            </button>
            {session && (
              <button onClick={() => handleNavigation("/home")} className="btn btn-ghost gap-2">
                <FiHome /> Accueil
              </button>
            )}
          </div>

          {/* Center - Desktop navigation */}
          <div className="hidden sm:flex flex-1 items-center gap-6 justify-start">
            <div className="dropdown dropdown-hover">
              <label tabIndex={0} className="btn btn-ghost gap-2">
                <FiLayout /> Espaces
              </label>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow rounded-box w-52 bg-base-100">
                <li>{navItem("Administration", "/administration", <FiShield />)}</li>
                <li>{navItem("Partenaires", "/partenaires", <FiUsers />)}</li>
              </ul>
            </div>

            <div className="dropdown dropdown-hover">
              <label tabIndex={0} className="btn btn-ghost gap-2">
                <FiFileText /> Documentation
              </label>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow rounded-box w-52 bg-base-100">
      
                <li>{navItem("API", "/api-reference", <FiCode />)}</li>
              </ul>
            </div>
            {navItem("Conditions", "/terms-of-service", <FiBookOpen />)}
            {session && navItem("Contact", "/contact", <FiMail />)}
         

           
          </div>

          {/* Right - Theme and Auth */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost gap-2">
                <FiLayout /> Thème
              </label>
              <ul className="dropdown-content menu p-2 shadow-xl bg-base-300 rounded-box w-48 max-h-64 overflow-y-auto">
                {themes.map((theme) => (
                  <li key={theme}>
                    <button
                      className={`capitalize ${theme === currentTheme ? "font-bold text-primary" : ""}`}
                      onClick={() => handleThemeChange(theme)}
                    >
                      {theme} {theme === currentTheme && "✓"}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {session ? (
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost gap-2">
                  <FiUser /> {session.user?.username || "Compte"}
                </label>
                <ul className="dropdown-content menu p-2 shadow rounded-box w-52 bg-base-100">
                  <li>{navItem("Profil", "/home/profile", <FiUser />)}</li>
                  <li>
                    <button
                      onClick={() => setShowLogoutModal(true)}
                      className="flex items-center gap-2 px-4 py-2 text-error hover:bg-base-200"
                    >
                      <FiLogOut /> Déconnexion
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="hidden sm:flex gap-2">
                <button onClick={() => handleNavigation("/login")} className="btn btn-outline gap-2">
                  <FiUser /> Connexion
                </button>
                <button onClick={() => handleNavigation("/register")} className="btn btn-primary gap-2">
                  <FiEdit /> Inscription
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
