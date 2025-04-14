'use client';
import { useState, useEffect } from 'react';
import Link from "next/link";
import { 
  FaBell, 
  FaExclamationCircle, 
  FaExclamationTriangle, 
  FaCheckCircle,
  FaChevronDown,
  FaArrowUp,
  FaArrowDown
} from "react-icons/fa";
import { ImSpinner2 } from "react-icons/im";
import { getNotifications } from "@/services/notifications/notificationService";

export const NotificationsDropdown = ({ userId, accessToken }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalNotifications, setTotalNotifications] = useState(0);

  const severityIcons = {
    high: <FaExclamationCircle className="text-red-500" />,
    medium: <FaExclamationTriangle className="text-yellow-500" />,
    low: <FaCheckCircle className="text-green-500" />
  };

  const transactionIcons = {
    credit: <FaArrowUp className="text-green-600" />,
    debit: <FaArrowDown className="text-red-600" />
  };

  const loadNotifications = async (pageNumber = page) => {
    if (!hasMore || loading) return;
    
    setLoading(true);
    try {
      const response = await getNotifications(accessToken, pageNumber, 10);
      if (response.success) {
        // Filter out duplicates using a Set
        const newNotifications = response.notifications.filter(
          newNote => !notifications.some(existingNote => existingNote.id === newNote.id)
        );
        
        setNotifications(prev => [...prev, ...newNotifications]);
        setHasMore(response.hasMore);
        setTotalNotifications(response.total);
        setPage(prev => prev + 1);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight * 1.2 && !loading && hasMore) {
      loadNotifications();
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications(1);
    }
  }, [isOpen]);

  return (
    <div className="dropdown dropdown-bottom dropdown-left">
      <button 
        className="btn btn-ghost btn-circle hover:bg-gray-100 relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="indicator">
          <FaBell className="text-xl text-gray-600" />
          {!isOpen && totalNotifications > 0 && (
            <span className="badge badge-xs badge-primary indicator-item animate-pulse">
              {totalNotifications > 9 ? '9+' : totalNotifications}
            </span>
          )}
        </div>
      </button>
      
      {isOpen && (
      <div 
      className="mt-2 z-50 p-2 shadow-xl menu dropdown-content bg-base-100 rounded-box w-full sm:w-96 max-h-[70vh] overflow-hidden"
      style={{ marginLeft: '-8rem' }} // You can adjust this value
      onScroll={handleScroll}
    >
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <FaBell className="text-primary" />
              Notifications ({totalNotifications})
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="btn btn-circle btn-ghost btn-sm"
            >
              <FaChevronDown className="transform rotate-180 text-gray-500" />
            </button>
          </div>
          
          <div className="divide-y">
            {notifications.map(notification => (
              <Link
                key={notification.id}
                href={`/notifications/${notification.id}`}
                className="group p-4 hover:bg-gray-50 transition-colors flex items-start gap-3"
              >
                <div className="flex-shrink-0 pt-1 flex flex-col gap-2">
                  {transactionIcons[notification.type]}
                  {severityIcons[notification.severity.toLowerCase()] || severityIcons.low}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {notification.type} - {notification.severity}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(notification.sent_date).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {notification.message}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {loading && (
            <div className="p-4 flex justify-center">
              <ImSpinner2 className="animate-spin text-primary text-xl" />
            </div>
          )}

          {!hasMore && (
            <div className="p-4 text-center text-gray-500 text-sm bg-gray-50">
              No more notifications to show
            </div>
          )}
        </div>
      )}
    </div>
  );
};