'use client';
import Link from "next/link";
import { getAuthorizedLinks } from "@/config/dashboard-links";
import { iconComponents } from "@/utils/icons";
import { useSession } from 'next-auth/react';

export const Sidebar = () => {
  const { data: session } = useSession();

  return (
    <ul className="menu p-4 w-64 h-full bg-base-200 z-1 text-base-content">
      {session ? (
        getAuthorizedLinks(session.user.role).map((link, index) => (
          <li key={index}>
            <Link href={link.path} className="text-lg hover:text-primary">
              <span className="text-current">
                {iconComponents[link.icon]({ className: "mr-2", size: "20" })}
              </span>
              {link.label}
            </Link>
          </li>
        ))
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