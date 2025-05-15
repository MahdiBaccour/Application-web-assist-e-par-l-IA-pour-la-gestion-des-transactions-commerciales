// components/FeaturesSection.jsx
import { motion } from 'framer-motion';
import { FiCheckCircle, FiShield, FiUsers, FiPieChart, FiActivity } from 'react-icons/fi';

export default function FeaturesSection() {
  const currentTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') : 'light';
  const isDark = currentTheme === 'dark';
  const resolvedTextColor = isDark ? 'text-gray-300' : 'text-gray-700';
  const resolvedPrimaryColor = isDark ? 'text-blue-400' : 'text-blue-600';
  const features = [
    {
      title: 'IA Prédictive',
      description: "Optimisation des stocks et prévisions de demande grâce à l'intelligence artificielle",
      icon: <FiActivity className="w-6 h-6" />,
    },
    {
      title: 'Classification Fournisseurs/Clients',
      description: 'Système intelligent de catégorisation pour une gestion administrateur optimale',
      icon: <FiUsers className="w-6 h-6" />,
    },
    {
      title: 'Prévision Budgétaire',
      description: 'Outils avancés de projection financière avec analyses en temps réel',
      icon: <FiPieChart className="w-6 h-6" />,
    },
    {
      title: 'Sécurité Renforcée',
      description: 'Protection des données avec chiffrement AES-256 et authentification à deux facteurs',
      icon: <FiShield className="w-6 h-6" />,
    },
    {
      title: 'Gestion de la Chaîne Logistique',
      description: "Visibilité et contrôle de bout en bout des opérations",
      icon: <FiCheckCircle className="w-6 h-6" />,
    },
    {
      title: 'Collaboration en Temps Réel',
      description: 'Plateforme unifiée pour tous les acteurs de la chaîne',
      icon: <FiCheckCircle className="w-6 h-6" />,
    },
  ];

  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-xl bg-base-200 transition-all hover:transform hover:scale-105"
            >
              <div className={resolvedPrimaryColor}>
                {feature.icon}
              </div>
              <h3 className={`text-2xl font-semibold ${resolvedTextColor} mt-4 mb-2`}>
                {feature.title}
              </h3>
              <p className={resolvedTextColor}>
                {feature.description}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}