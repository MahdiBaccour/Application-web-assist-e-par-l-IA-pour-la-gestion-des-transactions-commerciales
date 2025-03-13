import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from '../providers/authProvider';
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Admin Dashboard",
  description: "Admin Dashboard charts",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
<body className={inter.className}>
      <AuthProvider>
        //lenna DashboardLayout
      {children}
      </AuthProvider>
      </body>
    </html>
  );
}