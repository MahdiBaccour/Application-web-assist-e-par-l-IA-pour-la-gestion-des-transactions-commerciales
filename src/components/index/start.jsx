'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowRight, FiLogIn, FiUserPlus } from 'react-icons/fi';

// Theme classification
const lightThemes = [
  "light", "cupcake", "bumblebee", "emerald", "corporate",
  "retro", "valentine", "garden", "aqua", "lofi", "pastel",
  "fantasy", "lemonade", "winter"
];

const darkThemes = [
  "dark", "synthwave", "cyberpunk", "halloween", "forest",
  "black", "luxury", "dracula", "cmyk", "autumn", "business",
  "acid", "night", "coffee"
];

export default function AuthSpaces() {
  const [theme, setTheme] = useState('light');
  const [hoveredSection, setHoveredSection] = useState(null);

  const isLightTheme = (currentTheme) => lightThemes.includes(currentTheme);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    setTheme(savedTheme);
  }, []);

  const sections = [
    {
      id: 'login',
      title: 'Connexion',
      description: 'Accédez à votre compte pour gérer vos informations et activités',
      bgImageLight: 'https://res.cloudinary.com/dmnuz4h65/image/upload/v1749589064/projet-pfe/other/connexionLight_lkj9f0.png',
      bgImageDark: 'https://res.cloudinary.com/dmnuz4h65/image/upload/v1749589186/projet-pfe/other/connexionDark_zzcewz.png',
      icon: <FiLogIn className="w-8 h-8" />
    },
    {
      id: 'register',
      title: 'Inscription',
      description: 'Créez un nouveau compte pour commencer votre aventure',
      bgImageLight: 'https://res.cloudinary.com/dmnuz4h65/image/upload/v1749589060/projet-pfe/other/inscriptionLight_nviorh.png',
      bgImageDark: 'https://res.cloudinary.com/dmnuz4h65/image/upload/v1749589181/projet-pfe/other/inscriptionDark_z4k4pv.png',
      icon: <FiUserPlus className="w-8 h-8" />
    }
  ];

  return (
    <div className="min-h-screen bg-base-100">
      <div className="flex flex-col md:flex-row h-screen">
        {sections.map((section) => (
          <motion.div
            key={section.id}
            className="relative flex-1 overflow-hidden group"
            initial={{ opacity: 0.9 }}
            animate={{
              flex: hoveredSection === section.id ? 2 : 1
            }}
            transition={{ duration: 0.5 }}
            onHoverStart={() => setHoveredSection(section.id)}
            onHoverEnd={() => setHoveredSection(null)}
          >
            <Image
              src={isLightTheme(theme) ? section.bgImageLight : section.bgImageDark}
              alt=""
              fill
              className="object-contain transition-transform duration-500 group-hover:scale-105"
              quality={100}
              priority
            />
            
            <div className={`absolute inset-0 ${isLightTheme(theme) ? 'bg-black/30' : 'bg-black/50'} transition-all duration-300 flex items-center justify-center`}>
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{
                  y: hoveredSection === section.id ? 0 : 50,
                  opacity: hoveredSection === section.id ? 1 : 0
                }}
                className="text-center p-6"
              >
                <div className="mb-4 text-primary">{section.icon}</div>
                <h2 className="text-4xl font-bold text-base-content mb-4">{section.title}</h2>
                <p className="text-base-content/90 mb-8 max-w-md mx-auto">{section.description}</p>

                <Link
                  href={`/${section.id}`}
                  className="btn btn-primary btn-lg gap-2 hover:gap-3 transition-all"
                >
                  Accéder
                  <FiArrowRight className="text-xl" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}