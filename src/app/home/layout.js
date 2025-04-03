import { Inter } from "next/font/google";
import AuthProvider from '@/providers/authProvider';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Home Dashboard",
  description: "Dashboard charts",
};

export default function HomeLayout({ children }) {
  return (
    <div className={inter.className}>
      <AuthProvider>
      <DashboardLayout>{children}</DashboardLayout>
      </AuthProvider>
     
    </div>
  );
}
