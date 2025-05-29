'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiHome, FiAlertTriangle, FiMail, FiArrowRight, FiSearch } from 'react-icons/fi';
import dynamic from 'next/dynamic';

function NotFound() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState('light');
  const [query, setQuery] = useState('');
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const router = useRouter();

  const routes = [
    { name: "Accueil", path: "/" },
    { name: "Administration", path: "/admin" },
    { name: "Contact", path: "/contact-admin" },
    { name: "Connexion", path: "/login" },
    { name: "Détails", path: "/details" },
    { name: "Home", path: "/home" }
  ];

  useEffect(() => {
    const handleThemeChange = () => {
      const newTheme = localStorage.getItem('theme') || 'light';
      setTheme(newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    };

    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
    setMounted(true);
    document.title = "404 - Page non trouvée";

    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  useEffect(() => {
    const results = routes
      .filter(r => r.name.toLowerCase().includes(query.toLowerCase()) || r.path.includes(query))
      .map(r => r.path);
    setFilteredRoutes(results);
  }, [query]);

  if (!mounted) return null;

  const handleSearch = (e) => {
    e.preventDefault();
    const match = routes.find(r =>
      r.name.toLowerCase().includes(query.toLowerCase()) || r.path === query
    );
    if (match) {
      router.push(match.path);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 transition-all duration-300 bg-base-100"
      data-theme={theme}
    >
      <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl w-full p-8">
        {/* Image Section */}
        <div className="flex-1">
          <Image
            src="https://res.cloudinary.com/dmnuz4h65/image/upload/v1744465382/projet-pfe/other/image_g7rdxa.png"
            alt="404 Illustration"
            width={600}
            height={600}
            className="rounded-lg shadow-xl border-2 border-base-200"
            priority
          />
        </div>

        {/* Text Section */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="badge badge-lg badge-warning gap-2">
            <FiAlertTriangle className="text-lg" />
            Erreur 404
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-base-content">
            <span className="bg-gradient-to-r from-warning to-secondary bg-clip-text text-transparent">
              Page Introuvable
            </span>
          </h1>

          <p className="text-lg text-base-content/80 leading-relaxed">
            La ressource que vous recherchez a été déplacée, supprimée ou n'existe pas.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative w-full max-w-md mx-auto lg:mx-0">
            <div className="flex items-center bg-base-200 rounded-lg shadow-md overflow-hidden">
              <span className="px-3 text-base-content/70"><FiSearch /></span>
              <input
                type="text"
                placeholder="Rechercher une page (ex: accueil, admin...)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input input-bordered w-full border-0 focus:outline-none bg-base-200"
              />
            </div>
            {query && filteredRoutes.length > 0 && (
              <ul className="absolute z-10 bg-base-100 w-full mt-1 rounded-md shadow border border-base-300">
                {filteredRoutes.map((path) => (
                  <li
                    key={path}
                    className="p-2 hover:bg-base-200 cursor-pointer text-sm text-base-content"
                    onClick={() => router.push(path)}
                  >
                    {path}
                  </li>
                ))}
              </ul>
            )}
          </form>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link href="/" className="btn btn-primary gap-2">
              <FiHome className="text-xl" />
              Page d'accueil
              <FiArrowRight className="text-xl" />
            </Link>
            <Link 
  href="/administration/contact"
  className="btn btn-ghost gap-2 border border-base-content/20 hover:border-base-content/40"
>
  <FiMail className="text-xl" />
  <span className="hover:underline">Contact Administrateur</span>
</Link>

          </div>

          {/* Footer Note */}
          <footer className="mt-8 text-sm space-y-1">
            <p>Code d'erreur : <code className="px-2 py-1 rounded">RESOURCE_NOT_FOUND</code></p>
            <p>Vérifiez l'URL ou utilisez la barre de recherche</p>
          </footer>
        </div>
      </div>
    </main>
  );
}

export default dynamic(() => Promise.resolve(NotFound), { ssr: false });