'use client';
import { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaBell, FaSearch, FaUser, FaSignOutAlt, FaCog } from "react-icons/fa";
import { NotificationsDropdown } from "@/components/profile/NotificationsDropdown";
import { getCacheBustedUrl } from "@/utils/image";
import { useUserContext } from '@/contexts/UserContext';
import { getAuthorizedLinks, customTitles } from "@/config/dashboard-links";
import {logoutUser} from "@/services/users/userService";
import { showErrorAlert, showSuccessAlert } from "@/utils/swalConfig";

export const Navbar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const { avatar } = useUserContext();
  const searchRef = useRef(null);

  const DEFAULT_AVATARS = {
    male: "https://res.cloudinary.com/dmnuz4h65/image/upload/v1744530755/projet-pfe/user-avatar/default-avatar-male_qhkopo.jpg",
    female: "https://res.cloudinary.com/dmnuz4h65/image/upload/v1744530919/projet-pfe/user-avatar/dafault-avatar-female_nbkebo.jpg"
  };

  // Gestion des liens et suggestions
  const authorizedLinks = getAuthorizedLinks(session?.user?.role);
  const allLinks = authorizedLinks.map(link => ({
    ...link,
    title: customTitles[link.path.split('/').pop()] || link.label
  }));

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredSuggestions([]);
      return;
    }
    
    const results = allLinks.filter(link =>
      link.title.toLowerCase().includes(query.toLowerCase()) ||
      link.path.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredSuggestions(results.slice(0, 5));
  };

  const handleSearchSubmit = () => {
    if (filteredSuggestions.length > 0) {
      router.push(filteredSuggestions[0].path);
      setSearchQuery('');
    }
  };

  const getAvatarUrl = () => {
    if (avatar) return avatar;
    if (session?.user?.image) return getCacheBustedUrl(session.user.image);
    const genderChoice = session?.user?.name?.length % 2 === 0 ? 'female' : 'male';
    return DEFAULT_AVATARS[genderChoice];
  };

const handleLogout = async () => {
  try {
    if (session?.user?.accessToken) {
      const result = await logoutUser(session.user.accessToken);
      if (!result.success) {
        showErrorAlert(
          session?.user?.theme || "light",
          result.message || "Échec de la déconnexion côté serveur."
        );
      } else {
        showSuccessAlert(
          session?.user?.theme || "light",
          "Déconnexion enregistrée avec succès."
        );
      }
    }

    await signOut({ redirect: false });
    router.push('/');
  } catch (error) {
    showErrorAlert(
      session?.user?.theme || "light",
      "Erreur inattendue lors de la déconnexion."
    );
    console.error("Erreur de déconnexion :", error);
  }
};


  const fetchNotifications = async () => {
    setLoadingNotifications(true);
    try {
      const response = await getNotifications(session?.user.accessToken);
      if (response.success) {
        setNotifications(response.notifications);
      }
    } finally {
      setLoadingNotifications(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'high': return 'bg-red-100 border-red-500';
      case 'medium': return 'bg-yellow-100 border-yellow-500';
      default: return 'bg-green-100 border-green-500';
    }
  };

  useEffect(() => {
    if (isNotificationsOpen) {
      fetchNotifications();
    }
  }, [isNotificationsOpen]);

  return (
    <div className="navbar bg-base-100 shadow-lg sticky top-0 z-40 px-4 sm:px-6 lg:px-8">
      <div className="flex-1 gap-4">
        <label htmlFor="my-drawer-2" className="btn btn-ghost drawer-button lg:hidden text-primary">
          {/* Icône du menu hamburger */}
        </label>

        <div className="form-control relative" ref={searchRef}>
          <div className="input-group">
                  <input
          type="text"
          placeholder="Rechercher..."
          className="input input-bordered pl-10 pr-4 w-60 sm:w-64 focus:w-64 transition-all duration-300"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearchSubmit();
            }
          }}
            />
            <button className="btn btn-ghost absolute left-0 top-0 h-full">
              <FaSearch className="text-gray-400" />
            </button>
            
            {/* Suggestions de recherche */}
            {searchQuery && filteredSuggestions.length > 0 && (
              <div className="absolute top-12 w-full bg-white shadow-lg rounded-lg z-50">
                {filteredSuggestions.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                    onClick={() => {
                      router.push(item.path);
                      setSearchQuery('');
                    }}
                  >
                    <div className="font-medium text-gray-700">{item.title}</div>
                    <div className="text-sm text-gray-500">{item.path}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex-none gap-4">
        {session ? (
          <>
            <NotificationsDropdown 
              userId={session?.user.id}
              accessToken={session.user.accessToken}
            />


            {/* Profile dropdown */}
            <div className="dropdown dropdown-end">
              <label 
                tabIndex={0} 
                className="btn btn-ghost btn-circle avatar hover:bg-gray-100"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="w-10 rounded-full border-2 border-primary/10">
                  <img 
                    src={getAvatarUrl()} 
                    alt="User avatar" 
                    className="object-cover"
                    onError={(e) => {
                      e.target.src = DEFAULT_AVATARS.male;
                    }}
                  />
                </div>
              </label>
              
              {isDropdownOpen && (
                <ul className="mt-3 z-50 p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-box w-52 border border-gray-100">
                  <li>
                    <Link 
                      href="/home/profile" 
                      className="flex items-center gap-2 px-4 py-2  rounded-lg"
                    >
                      <FaUser className="text-base-content" />
                      <span className="text-base-content">Profil</span>
                    </Link>
                  </li>
                 
                  <li>
                    <button 
                      onClick={() => setShowLogoutModal(true)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-lg text-red-600"
                    >
                      <FaSignOutAlt />
                      <span>Déconnexion</span>
                    </button>
                  </li>
                </ul>
              )}
            </div>

            {/* Logout Modal */}
            {showLogoutModal && (
              <div className="modal modal-open z-[100]">
                <div className="modal-box">
                  <h3 className="font-bold text-lg">Confirmer la déconnexion</h3>
                  <p className="py-4">Êtes-vous sûr de vouloir vous déconnecter ?</p>
                  <div className="modal-action">
                    <button 
                      className="btn btn-ghost"
                      onClick={() => setShowLogoutModal(false)}
                    >
                      Annuler
                    </button>
                    <button 
                      className="btn btn-error hover:bg-red-600"
                      onClick={handleLogout}
                    >
                      Déconnexion
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <Link href="/login" className="btn btn-primary">S'inscrire</Link>
        )}
      </div>
    </div>
  );
};