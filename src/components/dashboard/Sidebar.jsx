'use client';

import Link from "next/link";
import { getAuthorizedLinks } from "@/config/dashboard-links";
import { iconComponents } from "@/utils/icons";
import { useSession } from 'next-auth/react';
import { FiPackage } from "react-icons/fi";
import { useRouter } from "next/navigation";

export const Sidebar = () => {
  const { data: session } = useSession();
  const router = useRouter();

  const handleNavigation = (path) => {
    router.push(path);
  };

  return (
    <ul className="menu p-4 w-64 h-full bg-base-200 z-1 text-base-content">
      {session ? (
        <>
          {/* Logo / Accueil */}
          <button
            onClick={() => handleNavigation("/")}
            className="flex items-center gap-2 mb-6 hover:bg-base-300 p-2 rounded-lg"
          >
            <FiPackage className="w-7 h-7 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SupplyChain Pro
            </span>
          </button>

          {/* Liens autorisés */}
          {getAuthorizedLinks(session.user.role).map((link, index) => {
            const Icon = iconComponents[link.icon];
            return (
              <li key={index}>
                <Link href={link.path} className="text-lg hover:text-primary flex items-center">
                  <Icon className="mr-2" size={20} />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </>
      ) : (
        <li className="text-error p-4">
          <div className="flex items-center">
            {iconComponents.FaUser({ className: "mr-2" })}
            <span>Non autorisé - Veuillez vous connecter</span>
          </div>
        </li>
      )}
    </ul>
  );
};