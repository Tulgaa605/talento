'use client';

import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';

export type NotificationType = 'success' | 'error' | 'info';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  timestamp: number;
  category?: string;
  shown: boolean;
}

interface DatabaseNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  databaseNotifications: DatabaseNotification[];
  addNotification: (message: string, type: NotificationType, category?: string) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;
  fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STORAGE_KEY = 'notifications';
const SHOWN_NOTIFICATIONS_KEY = 'shown_notifications';
const APPLICATION_NOTIFICATIONS_KEY = 'application_notifications';
const APPLICATION_VIEWED_KEY = 'application_viewed';

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [databaseNotifications, setDatabaseNotifications] = useState<DatabaseNotification[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!isClient) return;

    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setDatabaseNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [isClient]);

  const markNotificationAsRead = useCallback(async (id: string) => {
    if (!isClient) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });

      if (response.ok) {
        setDatabaseNotifications(prev => prev.filter(n => n.id !== id));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;

    const storedNotifications = localStorage.getItem(STORAGE_KEY);
    const shownNotifications = JSON.parse(localStorage.getItem(SHOWN_NOTIFICATIONS_KEY) || '[]');

    if (storedNotifications) {
      try {
        const parsed: Notification[] = JSON.parse(storedNotifications);
        const unshownNotifications = parsed.filter((n) => !shownNotifications.includes(n.id));
        setNotifications(unshownNotifications);
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications, isClient]);

  const addNotification = useCallback((message: string, type: NotificationType, category?: string) => {
    if (!isClient) return;

    setNotifications(prev => {
      const shownNotifications: string[] = JSON.parse(localStorage.getItem(SHOWN_NOTIFICATIONS_KEY) || '[]');
      const notificationId = `${category || type}-${message}-${Date.now()}`;

      if (shownNotifications.includes(notificationId)) {
        return prev;
      }

      if (category === 'applications') {
        const applicationNotifications: Array<{ id: string; timestamp: number }> = JSON.parse(
          localStorage.getItem(APPLICATION_NOTIFICATIONS_KEY) || '[]'
        );
        const applicationViewed: string[] = JSON.parse(localStorage.getItem(APPLICATION_VIEWED_KEY) || '[]');

        if (applicationViewed.includes(notificationId)) {
          return prev;
        }

        const recentNotification = applicationNotifications.find(n => Date.now() - n.timestamp < 5 * 60 * 1000);
        if (recentNotification) {
          return prev;
        }

        applicationNotifications.push({ id: notificationId, timestamp: Date.now() });
        localStorage.setItem(APPLICATION_NOTIFICATIONS_KEY, JSON.stringify(applicationNotifications));

        applicationViewed.push(notificationId);
        localStorage.setItem(APPLICATION_VIEWED_KEY, JSON.stringify(applicationViewed));
      }

      shownNotifications.push(notificationId);
      localStorage.setItem(SHOWN_NOTIFICATIONS_KEY, JSON.stringify(shownNotifications));

      const newNotification: Notification = {
        id: notificationId,
        message,
        type,
        timestamp: Date.now(),
        category,
        shown: false,
      };

      return [...prev, newNotification];
    });
  }, [isClient]);

  const removeNotification = useCallback((id: string) => {
    if (!isClient) return;

    setNotifications(prev => {
      const n = prev.find(x => x.id === id);
      if (!n) return prev;

      const shownNotifications: string[] = JSON.parse(localStorage.getItem(SHOWN_NOTIFICATIONS_KEY) || '[]');
      if (!shownNotifications.includes(id)) {
        shownNotifications.push(id);
        localStorage.setItem(SHOWN_NOTIFICATIONS_KEY, JSON.stringify(shownNotifications));
      }

      if (n.category === 'applications') {
        const applicationNotifications: Array<{ id: string; timestamp: number }> = JSON.parse(
          localStorage.getItem(APPLICATION_NOTIFICATIONS_KEY) || '[]'
        );
        const applicationViewed: string[] = JSON.parse(localStorage.getItem(APPLICATION_VIEWED_KEY) || '[]');

        applicationNotifications.push({ id, timestamp: Date.now() });
        localStorage.setItem(APPLICATION_NOTIFICATIONS_KEY, JSON.stringify(applicationNotifications));

        if (!applicationViewed.includes(id)) {
          applicationViewed.push(id);
          localStorage.setItem(APPLICATION_VIEWED_KEY, JSON.stringify(applicationViewed));
        }
      }

      const updated = prev.filter(notification => notification.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [isClient]);

  if (!isClient) {
    return (
      <NotificationContext.Provider
        value={{
          notifications: [],
          databaseNotifications: [],
          addNotification,
          removeNotification,
          markNotificationAsRead,
          fetchNotifications,
        }}
      >
        {children}
      </NotificationContext.Provider>
    );
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        databaseNotifications,
        addNotification,
        removeNotification,
        markNotificationAsRead,
        fetchNotifications,
      }}
    >
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {notifications
          .filter(notification => !notification.shown)
          .map(notification => {
            setTimeout(() => {
              removeNotification(notification.id);
            }, 3500);

            return (
              <div
                key={notification.id}
                className={`p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
                  notification.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-800'
                    : notification.type === 'error'
                    ? 'bg-red-50 border border-red-200 text-red-800'
                    : 'bg-blue-50 border border-blue-200 text-blue-800'
                }`}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {notification.type === 'success' ? (
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : notification.type === 'error' ? (
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{notification.message}</p>
                  </div>
                  <div className="ml-auto pl-3">
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <span className="sr-only">Close</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
