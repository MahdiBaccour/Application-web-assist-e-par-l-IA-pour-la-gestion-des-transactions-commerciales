'use client';
import { useEffect, useState } from 'react';
import { 
  FiAlertTriangle, 
  FiLock, 
  FiDatabase, 
  FiUserCheck, 
  FiFileText,
  FiShield,
  FiClock,
  FiBookOpen
} from 'react-icons/fi';

export default function TermsOfService() {
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    setTheme(savedTheme);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-base-100 text-base-content transition-colors duration-300">
      <div className="container mx-auto px-6 py-16 max-w-7xl">
        {/* En-tête */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            Conditions Générales d'Utilisation
          </h1>
          <p className="text-lg text-base-content/80">
            Version 2.1 - En vigueur depuis le {new Date('2024-01-01').toLocaleDateString('fr-FR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        {/* Table des matières */}
        <div className="card bg-base-200 mb-12 p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-base-content">
            <FiBookOpen className="text-primary" />
            Sommaire
          </h2>
          <ul className="grid md:grid-cols-2 gap-4">
            {['1. Acceptation des CGU', '2. Droits utilisateurs', '3. Protection des données', 
              '4. Propriété intellectuelle', '5. Responsabilités', '6. Résiliation'].map((item, index) => (
              <li key={index} className="cursor-pointer text-primary font-semibold hover:underline">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Sections détaillées */}
        <div className="grid gap-8">
          {/* Article 1 */}
          <div className="card bg-base-200 p-6 lg:p-8 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="flex items-start gap-4 mb-6">
              <FiAlertTriangle className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-2 text-base-content">Article 1 - Acceptation des CGU</h2>
                <p className="text-base-content/90">
                  En accédant à nos services, vous acceptez sans réserve l'intégralité des présentes conditions.
                  Ces CGU constituent un contrat légal entre vous et SupplyChain Pro.
                </p>
              </div>
            </div>
            <div className="ml-12 space-y-4">
              <div className="bg-base-300 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">1.1 Portée de l'accord</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Applicables à tous les services en ligne</li>
                  <li>Incluent les mises à jour automatiques</li>
                  <li>Prévalent sur tout accord antérieur</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Article 2 */}
          <div className="card bg-base-200 p-6 lg:p-8 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="flex items-start gap-4 mb-6">
              <FiLock className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-2 text-base-content">Article 2 - Protection des Données</h2>
                <p className="text-base-content/90">
                  Conformément au RGPD et à la loi Informatique et Libertés, nous garantissons une protection
                  maximale de vos données personnelles.
                </p>
              </div>
            </div>
            <div className="ml-12 grid md:grid-cols-2 gap-6">
              <div className="bg-base-300 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">2.1 Collecte des données</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Données techniques (IP, navigateur)</li>
                  <li>Données de profil (nom, email)</li>
                  <li>Données d'utilisation (logs)</li>
                </ul>
              </div>
              <div className="bg-base-300 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">2.2 Sécurité</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Chiffrement AES-256</li>
                  <li>Audits trimestriels</li>
                  <li>Certification ISO 27001</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Article 3 */}
          <div className="card bg-base-200 p-6 lg:p-8 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="flex items-start gap-4 mb-6">
              <FiDatabase className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold mb-2 text-base-content">Article 3 - Propriété Intellectuelle</h2>
                <p className="text-base-content/90">
                  Tous les éléments constitutifs de la plateforme sont et restent la propriété exclusive
                  de SupplyChain Pro SAS.
                </p>
              </div>
            </div>
            <div className="ml-12 space-y-4">
              <div className="bg-base-300 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">3.1 Licence d'utilisation</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Droit d'accès non exclusif</li>
                  <li>Interdiction de reproduction</li>
                  <li>Limitation aux besoins professionnels</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section de conformité */}
          <div className="mt-12 p-8 bg-gradient-to-br from-primary to-secondary rounded-2xl text-base-100">
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">Conformité Réglementaire</h3>
                <p>Notre plateforme respecte les principales réglementations internationales</p>
              </div>
              <div className="flex gap-4 flex-wrap">
                <div className="badge badge-lg badge-outline">RGPD</div>
                <div className="badge badge-lg badge-outline">ISO 27001</div>
                <div className="badge badge-lg badge-outline">SOC 2</div>
              </div>
            </div>
          </div>

          {/* Historique des versions */}
          <div className="card bg-base-200 mt-12 p-6 text-base-content">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <FiClock className="text-primary" />
              Historique des révisions
            </h2>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Version</th>
                    <th>Date</th>
                    <th>Modifications</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>2.1</td>
                    <td>01/01/2024</td>
                    <td>Mise à jour des clauses de sécurité</td>
                  </tr>
                  <tr>
                    <td>2.0</td>
                    <td>01/07/2023</td>
                    <td>Conformité RGPD renforcée</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}