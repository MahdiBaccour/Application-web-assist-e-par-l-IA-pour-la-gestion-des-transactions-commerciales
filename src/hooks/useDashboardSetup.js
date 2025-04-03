import { usePathname } from 'next/navigation';
import { customTitles } from '../config/dashboard-links';

export const useDashboardSetup = (session) => {
  const pathname = usePathname();
  const theme = session?.user?.theme || 'light';

  const setupPageTitle = () => {
    const segments = pathname.split('/').filter(segment => segment !== '');
    let currentPage = 'home';
    
    for (let i = segments.length - 1; i >= 0; i--) {
      if (!/^\d+$/.test(segments[i])) {
        currentPage = segments[i];
        break;
      }
    }

    const formattedPageName = currentPage
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const baseName = customTitles[currentPage] || formattedPageName;
    document.title = `Home - ${baseName} | PFE-licence`;
    document.documentElement.setAttribute('data-theme', theme);
  };

  return { setupPageTitle };
};