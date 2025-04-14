export const customTitles = {
  'home': 'Tableau de Bord',
  'products': 'Gestion des Produits',
  'suppliers': 'Annuaire des Fournisseurs',
  'clients': 'Espace Clients',
  'transactions': 'Historique des Transactions',
  'payments': 'Suivi des Paiements',
  'reports': 'Analytique & Rapports',
  'logs': 'Journaux d’Audit',
  'q-and-a': 'Section Q&R',
  'messages': 'Chatbot & Messages',
  'settings': 'Paramètres Système'
};
  
export const getAuthorizedLinks = (role) => {
  const baseLinks = [
    { path: "/home", icon: 'FaHome', label: "Accueil" }
  ];

  switch(role) {
    case 'owner':
      return [
        ...baseLinks,
        { path: "/home/clients", icon: 'FaUserTie', label: "Clients" },
        { path: "/home/suppliers", icon: 'FaIndustry', label: "Fournisseurs" },
        { path: "/home/products", icon: 'FaBoxOpen', label: "Produits" },
        { path: "/home/transactions", icon: 'FaExchangeAlt', label: "Transactions" },
        { path: "/home/payments", icon: 'FaCreditCard', label: "Paiements" },
      
        { path: "/home/reports", icon: 'FaChartBar', label: "Rapports" },
        { path: "/home/ai-predictions", icon: 'FaBrain', label: "IA & Prédictions" },
      
        { path: "/home/logs", icon: 'FaHistory', label: "Journaux & Audits" },
        { path: "/home/messages", icon: 'FaComments', label: "Messages & Chatbot" },
        { path: "/home/q-and-a", icon: 'FaQuestionCircle', label: "Questions & Réponses" },
      
        { path: "/home/settings", icon: 'FaCog', label: "Paramètres" },
        { path: "/home/users", icon: 'FaUsers', label: "Utilisateurs" }
      ];
    case 'employee':
      return [
        ...baseLinks,
        { path: "/home/products", icon: 'FaBoxOpen', label: "Produits" },
        { path: "/home/transactions", icon: 'FaExchangeAlt', label: "Transactions" },
        { path: "/home/payments", icon: 'FaExchangeAlt', label: "Paiements" },
        { path: "/home/q-and-a", icon: 'FaQuestionCircle', label: "Questions & Réponses" },
        { path: "/home/messages", icon: 'FaComments', label: "Messages & Chatbot" },
        { path: "/home/settings", icon: 'FaCog', label: "Paramètres" }
      ];
    case 'client':
    case 'supplier':
      return [
        ...baseLinks,
        { path: "/home/q-and-a", icon: 'FaQuestionCircle', label: "Questions & Réponses" },
        { path: "/home/messages", icon: 'FaComments', label: "Messages & Chatbot" },
        { path: "/home/settings", icon: 'FaCog', label: "Paramètres" }
      ];
    default:
      return baseLinks;
  }
};