// app/forbidden/page.jsx
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiHome, FiShieldOff, FiMail, FiArrowRight } from 'react-icons/fi';
import dynamic from 'next/dynamic';

function ForbiddenPage() {
  const [mounted, setMounted] = useState(false);
  const [referenceId, setReferenceId] = useState('');

  useEffect(() => {
    document.title = "401 - Accès non autorisé";
    setReferenceId(Math.random().toString(36).substr(2, 9).toUpperCase());
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 px-4">
      <div className="flex flex-col lg:flex-row items-center gap-12 max-w-6xl w-full p-8">
        {/* Image Section */}
        <div className="flex-1">
          <Image
            src="https://res.cloudinary.com/dmnuz4h65/image/upload/v1744541814/projet-pfe/other/401_sflo1g.png"
            alt="Accès refusé"
            width={600}
            height={600}
            className="rounded-lg shadow-xl border-2 border-base-200"
            priority
          />
        </div>

        {/* Text Section */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="badge badge-lg badge-error gap-2">
            <FiShieldOff className="text-lg" />
            401 Non Autorisé
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-base-content">
            <span className="bg-gradient-to-r from-error to-warning bg-clip-text text-transparent">
              Accès Restreint
            </span>
          </h1>

          <p className="text-xl text-base-content/80 leading-relaxed">
            Vous n'avez pas les privilèges nécessaires pour accéder à cette ressource.
            Veuillez contacter votre administrateur système ou utiliser un compte autorisé.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Link href="/" className="btn btn-primary gap-2">
              <FiHome className="text-xl" />
              Page d'accueil
              <FiArrowRight className="text-xl" />
            </Link>

            <Link href="/administration/contact" className="btn btn-outline gap-2">
              <FiMail className="text-xl" />
              Contact Administrateur
            </Link>
          </div>

          <div className="mt-8 text-sm text-base-content/60">
            <p>Code d'erreur: EACCES_FORBIDDEN</p>
            <p>ID de référence: #{referenceId}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default dynamic(() => Promise.resolve(ForbiddenPage), { ssr: false });