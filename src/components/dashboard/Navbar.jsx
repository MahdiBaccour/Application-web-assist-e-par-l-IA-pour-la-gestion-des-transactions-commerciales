'use client';
import { useState } from 'react';
import Link from "next/link";
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FaBell, FaSearch, FaUser, FaSignOutAlt, FaCog } from "react-icons/fa";

export const Navbar = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    //need to add logout
    router.push('/');
  };

  return (
    <div className="navbar bg-base-100 shadow-lg sticky top-0 ">
      <div className="flex-1">
        <label htmlFor="my-drawer-2" className="btn btn-ghost drawer-button lg:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </label>

        <div className="form-control ml-4">
          <div className="input-group">
            <input
              type="text"
              placeholder="Search..."
              className="input input-bordered w-64"
            />
            <button className="btn btn-square ml-2 absolute">
              <FaSearch size="20" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-none gap-4">
        {session ? (
          <>
            {/* Notification bell */}
            <button className="btn btn-ghost btn-circle">
              <div className="indicator">
                <FaBell size={20} className="text-base-content" />
                <span className="badge badge-xs badge-primary indicator-item"></span>
              </div>
            </button>

            {/* Profile dropdown */}
            <div className="dropdown dropdown-end">
              <label 
                tabIndex={0} 
                className="btn btn-ghost btn-circle avatar"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="w-10 rounded-full">
                  <img src={session.user?.image || "/default-avatar.png"} />
                </div>
              </label>
              {isDropdownOpen && (
                <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                  <li><Link href="/home/profile" className="text-base-content"><FaUser className="mr-2" /> Profile</Link></li>
                  <li><Link href="/home/settings" className="text-base-content"><FaCog className="mr-2" /> Settings</Link></li>
                  <li><button onClick={() => setShowLogoutModal(true)} className="text-base-content"><FaSignOutAlt className="mr-2" /> Logout</button></li>
                </ul>
              )}
            </div>

            {/* Logout Confirmation Modal */}
          
{showLogoutModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]">
    <div className="modal-box bg-base-100 p-6 rounded-lg shadow-lg z-[10000]">
      <h3 className="font-bold text-lg">Confirm Logout</h3>
      <p className="py-4">Are you sure you want to log out?</p>
      <div className="modal-action flex justify-end gap-4">
        <button className="btn" onClick={() => setShowLogoutModal(false)}>Cancel</button>
        <button className="btn btn-error" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  </div>
)}
          </>
        ) : (
          <Link href="/login" className="btn btn-primary">Sign In</Link>
        )}
      </div>
    </div>
  );
};