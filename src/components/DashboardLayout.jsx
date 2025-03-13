import Link from 'next/link';
import {
  FaHome, FaUsers, FaExchangeAlt, FaChartBar, FaCog, FaBell, FaSearch, FaUser, FaSignOutAlt,
} from 'react-icons/fa'; // Font Awesome icons
import { FaXTwitter } from 'react-icons/fa6'; // Twitter (X) icon
import { FaFacebook, FaLinkedin } from 'react-icons/fa'; // Font Awesome icons

export default function DashboardLayout({ children }) {
  return (
    <div className="drawer lg:drawer-open">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      
      {/* Main Content */}
      <div className="drawer-content flex flex-col min-h-screen">
        {/* Navbar */}
        <div className="navbar bg-base-100 shadow-lg sticky top-0 z-50">
          <div className="flex-1">
            <label htmlFor="my-drawer-2" className="btn btn-ghost drawer-button lg:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </label>
            
            {/* Search Bar */}
            <div className="form-control ml-4">
              <div className="input-group">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="input input-bordered w-64" 
                />
                <button className="btn btn-square ml-2 absolute">
                  <FaSearch size="20" /> {/* Search icon */}
                </button>
              </div>
            </div>
          </div>
          
          {/* Notification & Profile */}
          <div className="flex-none gap-4">
            <button className="btn btn-ghost btn-circle">
              <div className="indicator">
                <FaBell size="20" /> {/* Bell icon */}
                <span className="badge badge-xs badge-primary indicator-item"></span>
              </div>
            </button>
            
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                </div>
              </label>
              <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                <li><a><FaUser className="mr-2" size="16" /> Profile</a></li>
                <li><a><FaCog className="mr-2" size="16" /> Settings</a></li>
                <li><a><FaSignOutAlt className="mr-2" size="16" /> Logout</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 flex-grow">
          {children}
        </div>

        {/* Footer */}
        <footer className="footer items-center p-4 bg-neutral text-neutral-content">
          <div className="items-center grid-flow-col">
            <p>© 2023 Your Company. All rights reserved</p>
          </div> 
          <div className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
            <a><FaFacebook size="24" /></a> {/* Facebook icon */}
            <a><FaXTwitter size="24" /></a> {/* Twitter (X) icon */}
            <a><FaLinkedin size="24" /></a> {/* LinkedIn icon */}
          </div>
        </footer>
      </div>

      {/* Sidebar */}
      <div className="drawer-side">
        <label htmlFor="my-drawer-2" className="drawer-overlay"></label> 
        <ul className="menu p-4 w-80 min-h-full bg-base-200 text-base-content">
          <li>
            <Link href="/dashboard" className="text-lg">
              <FaHome className="mr-2" size="20" /> Dashboard
            </Link>
          </li>
          <li>
            <Link href="/users" className="text-lg">
              <FaUsers className="mr-2" size="20" /> Users
            </Link>
          </li>
          
                <li>
                  <Link href="/clients" className="text-lg">
                    <FaUsers className="mr-2" size="18" /> Clients
                  </Link>
                </li>
                <li>
                  <Link href="/suppliers" className="text-lg">
                    <FaUsers className="mr-2" size="18" /> Suppliers
                  </Link>
                </li>
          
          <li>
            <Link href="/transactions" className="text-lg">
              <FaExchangeAlt className="mr-2" size="20" /> Transactions
            </Link>
          </li>
          <li>
            <Link href="/reports" className="text-lg">
              <FaChartBar className="mr-2" size="20" /> Reports
            </Link>
          </li>
          <li>
  <Link href="/payments" className="text-lg">
    <FaExchangeAlt className="mr-2" size="20" /> Payments
  </Link>
</li>

          <li>
            <Link href="/settings" className="text-lg">
              <FaCog className="mr-2" size="20" /> Settings
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}