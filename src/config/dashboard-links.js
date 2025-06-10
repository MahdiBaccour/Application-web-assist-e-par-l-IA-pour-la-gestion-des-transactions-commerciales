export const customTitles = {
  'home': 'Tableau de Bord',
  'products': 'Gestion des Produits',
  'categories': 'Gestion des Catégories',
  'suppliers': 'Annuaire des Fournisseurs',
  'clients': 'Espace Clients',
  'transactions': 'Historique des Transactions',
  'payments': 'Suivi des Paiements',
  'reports': 'Analytique & Rapports',
  'logs': 'Journaux d’Audit',
  'q-and-a': 'Section Q&R',
  'messages': 'Chatbot & Messages',
  'total_budget': 'Budget Global', 
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
        { path: "/home/categories", icon: 'FaTags', label: "Catégories" },
        { path: "/home/transactions", icon: 'FaExchangeAlt', label: "Transactions" },
        { path: "/home/payments", icon: 'FaCreditCard', label: "Paiements" },
        { path: "/home/reports", icon: 'FaChartBar', label: "Rapports" },
        { path: "/home/ai-predictions", icon: 'FaBrain', label: "IA & Prédictions" },
        { path: "/home/logs", icon: 'FaHistory', label: "Journaux & Audits" },
        { path: "/home/messages", icon: 'FaComments', label: "Messages & Chatbot" },
        { path: "/home/budget", icon: 'FaWallet', label: "Budget Global" }, 
        { path: "/home/users", icon: 'FaUsers', label: "Utilisateurs" }
      ];
    case 'employee':
      return [
        ...baseLinks,
         { path: "/home/clients", icon: 'FaUserTie', label: "Clients" },
        { path: "/home/suppliers", icon: 'FaIndustry', label: "Fournisseurs" },
        { path: "/home/products", icon: 'FaBoxOpen', label: "Produits" },
        { path: "/home/categories", icon: 'FaTags', label: "Catégories" },
        { path: "/home/transactions", icon: 'FaExchangeAlt', label: "Transactions" },
        { path: "/home/payments", icon: 'FaCreditCard', label: "Paiements" },
      ];
    case 'client':
    case 'supplier':
      return [
        ...baseLinks,
        { path: "/home/messages", icon: 'FaComments', label: "Messages & Chatbot" }
      ];
    default:
      return baseLinks;
  }
};