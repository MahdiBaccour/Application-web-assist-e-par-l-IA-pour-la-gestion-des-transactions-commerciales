import { Inter } from "next/font/google";
import AuthProvider from '@/providers/authProvider';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { UserProvider } from '@/contexts/UserContext'; // ✅ Import the context

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Tableau de bord | Mon Application",
  description: "Visualisez les statistiques, les clients, les paiements et les activités récentes dans votre tableau de bord personnalisé.",
  keywords: "dashboard, analytics, tableau de bord, gestion clients, paiements",
  authors: [{ name: "VotreNom", url: "https://votresite.com" }],
  creator: "VotreNom",
  openGraph: {
    title: "Tableau de bord intelligent",
    description: "Gérez vos données en temps réel depuis un tableau de bord intuitif.",
    url: "https://votresite.com/dashboard",
    siteName: "Mon Application",
    images: [
      {
        url: "https://res.cloudinary.com/dmnuz4h65/image/upload/v17454/projet-pfe/other/dashboard_preview.png",
        width: 1200,
        height: 630,
        alt: "Aperçu du dashboard",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
};

export default function HomeLayout({ children }) {
  return (
    <div className={inter.className}>
      <AuthProvider>
        <UserProvider>
          <DashboardLayout>
            {children}
          </DashboardLayout>
        </UserProvider>
      </AuthProvider>
    </div>
  );
}