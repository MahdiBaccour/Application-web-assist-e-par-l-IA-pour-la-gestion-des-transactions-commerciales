"use client";
import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Navbar } from '@/components/dashboard/Navbar';
import { Footer } from '@/components/dashboard/Footer';
import { useDashboardSetup } from '@/hooks/useDashboardSetup';

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { setupPageTitle } = useDashboardSetup(session);
  useEffect(() => {
    if (session) setupPageTitle();
  }, [session, setupPageTitle]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" data-theme={session?.user?.theme || 'light'}>
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="drawer lg:drawer-open " data-theme={'cupcake'}>
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col min-h-screen z-0">
        <Navbar />
        <div className="p-4 flex-grow bg-base-100">{children}</div>
        <Footer />
      </div>

      <div className="drawer-side">
        <label htmlFor="my-drawer-2" className="drawer-overlay"></label>
        <Sidebar />
      </div>
    </div>
  );
}