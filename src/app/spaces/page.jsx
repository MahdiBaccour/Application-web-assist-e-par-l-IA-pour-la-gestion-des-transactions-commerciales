// app/spaces/page.jsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiArrowRight, FiShield, FiUsers } from 'react-icons/fi';

export default function SpacesPage() {
  const [theme, setTheme] = useState('light');
  const [hoveredSection, setHoveredSection] = useState(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    setTheme(savedTheme);
  }, []);

  const sections = [
    {
      id: 'administration',
      title: 'Espace Administration',
      description: 'Gestion complète des paramètres système et des utilisateurs',
      bgImage: 'https://res.cloudinary.com/dmnuz4h65/image/upload/v1746543210/admin_bg.jpg',
      icon: <FiShield className="w-8 h-8" />
    },
    {
      id: 'partenaires',
      title: 'Espace Partenaires',
      description: 'Collaboration et gestion des relations fournisseurs/clients',
      bgImage: 'https://res.cloudinary.com/dmnuz4h65/image/upload/v1746543211/partners_bg.jpg',
      icon: <FiUsers className="w-8 h-8" />
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
              src={section.bgImage}
              alt=""
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              quality={100}
            />
            
            <div className="absolute inset-0 bg-black/40 transition-all duration-300 flex items-center justify-center">
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