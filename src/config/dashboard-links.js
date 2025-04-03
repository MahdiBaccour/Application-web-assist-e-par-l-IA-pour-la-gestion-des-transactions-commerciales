export const customTitles = {
    'home': 'Dashboard',
    'products': 'Product Management',
    'suppliers': 'Supplier Directory',
    'clients': 'Client Hub',
    'transactions': 'Transaction Records',
    'payments': 'Payment Tracking',
    'reports': 'Analytics & Reports',
    'logs': 'Audit Logs',
    'q-and-a': 'Q&A Section',
    'messages': 'Chatbot & Messages',
    'settings': 'System Settings'
  };
  
  export const getAuthorizedLinks = (role) => {
    const baseLinks = [
      { path: "/home", icon: 'FaHome', label: "Home" }
    ];
  
    switch(role) {
      case 'owner':
        return [
          ...baseLinks,
          { path: "/home/users", icon: 'FaUsers', label: "Users" },
          { path: "/home/clients", icon: 'FaUserTie', label: "Clients" },
          { path: "/home/suppliers", icon: 'FaIndustry', label: "Suppliers" },
          { path: "/home/products", icon: 'FaBoxOpen', label: "Products" },
          { path: "/home/transactions", icon: 'FaExchangeAlt', label: "Transactions" },
          { path: "/home/payments", icon: 'FaExchangeAlt', label: "Payments" },
          { path: "/home/reports", icon: 'FaChartBar', label: "Reports" },
          { path: "/home/logs", icon: 'FaHistory', label: "Logs & Audit Trails" },
          { path: "/home/q-and-a", icon: 'FaQuestionCircle', label: "Q&A" },
          { path: "/home/messages", icon: 'FaComments', label: "Messages & Chatbot" },
          { path: "/home/settings", icon: 'FaCog', label: "Settings" }
        ];
      case 'employee':
        return [
          ...baseLinks,
          { path: "/home/products", icon: 'FaBoxOpen', label: "Products" },
          { path: "/home/transactions", icon: 'FaExchangeAlt', label: "Transactions" },
          { path: "/home/payments", icon: 'FaExchangeAlt', label: "Payments" },
          { path: "/home/q-and-a", icon: 'FaQuestionCircle', label: "Q&A" },
          { path: "/home/messages", icon: 'FaComments', label: "Messages & Chatbot" },
          { path: "/home/settings", icon: 'FaCog', label: "Settings" }
        ];
      case 'client':
      case 'supplier':
        return [
          ...baseLinks,
          { path: "/home/q-and-a", icon: 'FaQuestionCircle', label: "Q&A" },
          { path: "/home/messages", icon: 'FaComments', label: "Messages & Chatbot" },
          { path: "/home/settings", icon: 'FaCog', label: "Settings" }
        ];
      default:
        return baseLinks;
    }
  };