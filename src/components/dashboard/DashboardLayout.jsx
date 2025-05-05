"use client";
import { useState,useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Navbar } from '@/components/dashboard/Navbar';
import { Footer } from '@/components/dashboard/Footer';
import { useDashboardSetup } from '@/hooks/useDashboardSetup';

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const [theme, setTheme] = useState('light'); // Theme state
  const router = useRouter();
  const { setupPageTitle } = useDashboardSetup(session);

  useEffect(() => {
    if (session) setupPageTitle();
  }, [session, setupPageTitle]);

  // Set initial theme on mount or session change
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const sessionTheme = session?.user?.theme;
    setTheme(savedTheme || sessionTheme || 'light');
  }, [session?.user?.theme]);

  // Listen for theme changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'theme') setTheme(e.newValue || session?.user?.theme || 'light');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [session?.user?.theme]);

  // Listen for custom theme change events from same tab
  useEffect(() => {
    const handleThemeChange = () => {
      const savedTheme = localStorage.getItem('theme');
      setTheme(savedTheme || session?.user?.theme || 'light');
    };
    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, [session?.user?.theme]);


  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" data-theme={theme || 'light'}>
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="drawer lg:drawer-open" data-theme={theme || 'light'}>
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col min-h-screen">
        <Navbar />
        {/* Add pt-16 (64px) to account for navbar height */}
        <main className="flex-grow p-4 bg-base-100 pt-16"> {/* Added pt-16 here */}
          {children}
        </main>
        <Footer />
      </div>
      
      <div className="drawer-side">
        <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
        <Sidebar />
      </div>
    </div>
  );
}