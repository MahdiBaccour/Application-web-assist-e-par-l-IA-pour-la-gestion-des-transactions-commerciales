"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  FiBarChart,
  FiMessageCircle,
  FiShield
} from "react-icons/fi";

export default function EspacePartenaire() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "light";
    setTheme(saved);
    document.documentElement.setAttribute("data-theme", saved);
  }, []);

  /* ───────── sections sans “Mon tableau de bord” ───────── */
  const sections = [
    {
      title: "Historique de mes transactions",
      description:
        "Consultez et téléchargez le détail de toutes vos commandes passées avec l’entreprise :",
      image:
        "https://res.cloudinary.com/dmnuz4h65/image/upload/v1746695425/projet-pfe/other/partner_transactions_fqyeky.jpg",
      features: [
        { icon: <FiBarChart />, text: "Suivi du statut de règlement" }
      ]
    },
    {
      title: "Chatbot Assistance",
      description:
        "Posez vos questions 24 h/24 ; notre assistant IA vous répond instantanément :",
      image:
        "https://res.cloudinary.com/dmnuz4h65/image/upload/v1746695578/projet-pfe/other/chatbot_rhglth.jpg",
      features: [
        { icon: <FiMessageCircle />, text: "Réponses produit & livraison" },
        { icon: <FiShield />, text: "Aide sur la facturation sécurisée" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-base-100" data-theme={theme}>
      <div className="container mx-auto px-6 py-16">
        {sections.map((s, i) => (
          <div
            key={i}
            className={`flex flex-col ${
              i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
            } items-center gap-12 mb-20`}
          >
            {/* illustration */}
            <div className="w-full md:w-1/2 relative h-96 rounded-2xl overflow-hidden shadow-xl">
              <Image src={s.image} alt={s.title} fill className="object-cover" />
            </div>

            {/* texte */}
            <div className="w-full md:w-1/2 space-y-6">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {s.title}
              </h2>
              <p className="text-xl text-base-content">{s.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {s.features.map((f, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg bg-base-200 hover:bg-base-300 transition-all"
                  >
                    <div className="flex items-center gap-3 text-primary">
                      {f.icon}
                      <span className="font-medium">{f.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* bloc de sécurité */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-primary to-secondary">
          <div className="flex items-center gap-6">
            <FiShield className="w-12 h-12 text-white" />
            <div>
              <h3 className="text-2xl font-bold text-white">Données sécurisées</h3>
              <p className="text-white/90">
                Connexion HTTPS • Authentification JWT • RGPD compliant
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}