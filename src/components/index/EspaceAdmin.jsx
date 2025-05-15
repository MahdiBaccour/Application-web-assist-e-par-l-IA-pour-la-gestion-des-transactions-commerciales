"use client";
import { useEffect, useState } from "react";
import Image from 'next/image';
import { FiActivity, FiPieChart, FiBarChart, FiShield, FiFileText } from 'react-icons/fi';

export default function EspaceAdmin() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  const sections = [
    {
      title: "Tableau de Bord Intelligent",
      description: "Surveillance en temps réel des indicateurs clés de performance :",
      image: "https://res.cloudinary.com/dmnuz4h65/image/upload/v1746694368/projet-pfe/other/dashboardAnalysis_h6ue4l.jpg",
      features: [
        { icon: <FiActivity />, text: "Analyse prédictive des ventes" },
        { icon: <FiPieChart />, text: "Répartition des dépenses par catégorie" },
        { icon: <FiBarChart />, text: "Top 10 des produits les plus vendus" },
        { icon: <FiShield />, text: "Audit de sécurité en temps réel" }
      ]
    },
    {
      title: "Gestion des Transactions",
      description: "Interface complète pour suivre toutes les activités commerciales :",
      image: "https://res.cloudinary.com/dmnuz4h65/image/upload/v1746694633/projet-pfe/other/transaction_xxlftb.jpg",
      features: [
        { icon: <FiFileText />, text: "Historique détaillé des commandes" },
        { icon: <FiActivity />, text: "Suivi en temps réel des livraisons" },
        { icon: <FiPieChart />, text: "Analyse des relations fournisseurs" },
        { icon: <FiShield />, text: "Vérification des conformités" }
      ]
    },
    {
      title: "Module d'Intelligence Artificielle",
      description: "Outils avancés d'analyse prédictive :",
      image: "https://res.cloudinary.com/dmnuz4h65/image/upload/v1746694743/projet-pfe/other/ai_gqgss0.jpg",
      features: [
        { icon: <FiActivity />, text: "Classification automatique des partenaires" },
        { icon: <FiPieChart />, text: "Prévisions budgétaires intelligentes" },
        // { icon: <FiBarChart />, text: "Détection d'anomalies en temps réel" },
        // { icon: <FiShield />, text: "Analyse des risques automatisée" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-base-100" data-theme={theme}>
      <div className="container mx-auto px-6 py-16">
        {sections.map((section, index) => (
          <div 
            key={index}
            className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-12 mb-20`}
          >
            <div className="w-full md:w-1/2 relative h-96 rounded-2xl overflow-hidden shadow-xl">
              <Image
                src={section.image}
                alt={section.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="w-full md:w-1/2 space-y-6">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {section.title}
              </h2>
              <p className="text-xl text-base-content">
                {section.description}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.features.map((feature, idx) => (
                  <div 
                    key={idx}
                    className="p-4 rounded-lg bg-base-200 hover:bg-base-300 transition-all"
                  >
                    <div className="flex items-center gap-3 text-primary">
                      {feature.icon}
                      <span className="font-medium">{feature.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-primary to-secondary">
          <div className="flex items-center gap-6">
            <FiShield className="w-12 h-12 text-white" />
            <div>
              <h3 className="text-2xl font-bold text-white">Sécurité Renforcée</h3>
              <p className="text-white/90">
                Chiffrement Des données • Journal d'activité détaillé 
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}