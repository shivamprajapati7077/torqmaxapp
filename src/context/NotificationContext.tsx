import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { fetchDispatchOrders } from '../firebase';
import type { OrderStatus } from '../types/order';

export type NotificationType = 'order_placed' | 'order_dispatched' | 'order_delivered' | 'info';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  orderId?: string;
  createdAt: string;
  read: boolean;
}

interface NotifyParams {
  title: string;
  message: string;
  type: NotificationType;
  orderId?: string;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  activeToast: AppNotification | null;
  isDrawerOpen: boolean;
  permissionStatus: NotificationPermission | 'unsupported';
  notify: (params: NotifyParams) => void;
  dismissToast: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  requestNativePermission: () => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const STORAGE_KEY = 'torqmax_app_notifications_v1';
const KNOWN_STATUSES_KEY = 'torqmax_known_order_statuses_v1';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [activeToast, setActiveToast] = useState<AppNotification | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  // Save notifications to localStorage whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications]);

  // Request browser/system notification permission
  const requestNativePermission = useCallback(async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setPermissionStatus('unsupported');
      return false;
    }
    try {
      const perm = await Notification.requestPermission();
      setPermissionStatus(perm);
      return perm === 'granted';
    } catch {
      return false;
    }
  }, []);

  // Dismiss toast
  const dismissToast = useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    setActiveToast(null);
  }, []);

  // Dispatch notification across in-app toast, state, and system notification
  const notify = useCallback(
    ({ title, message, type, orderId }: NotifyParams) => {
      const newNotif: AppNotification = {
        id: 'notif_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        title,
        message,
        type,
        orderId,
        createdAt: new Date().toISOString(),
        read: false,
      };

      // 1. Add to in-app notification list
      setNotifications(prev => [newNotif, ...prev.filter(n => n.id !== newNotif.id)].slice(0, 40));

      // 2. Trigger in-app visual toast banner
      setActiveToast(newNotif);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = setTimeout(() => {
        setActiveToast(null);
      }, 5500);

      // 3. Vibrate device if supported
      try {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([100, 60, 120]);
        }
      } catch {
        // ignore
      }

      // 4. Send native device / OS notification if permission granted
      try {
        if (
          typeof window !== 'undefined' &&
          'Notification' in window &&
          Notification.permission === 'granted'
        ) {
          const systemNotif = new Notification(title, {
            body: message,
            icon: './torqmax-icon.png',
            badge: './torqmax-icon.png',
            tag: orderId ? `order_${orderId}` : undefined,
          });

          systemNotif.onclick = () => {
            window.focus();
            if ((window as any).__setActiveTab) {
              (window as any).__setActiveTab('account');
            }
          };
        }
      } catch (err) {
        console.warn('Native notification notice:', err);
      }
    },
    []
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__notify = notify;
    }
  }, [notify]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  // ─── BACKGROUND ORDER STATUS WATCHER ─────────────────────────────────
  // Polls orders and detects when status transitions (e.g. from new -> dispatched -> delivered)
  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    // Load known statuses map: orderId -> OrderStatus
    const getKnownStatuses = (): Record<string, OrderStatus> => {
      try {
        const raw = localStorage.getItem(KNOWN_STATUSES_KEY);
        return raw ? JSON.parse(raw) : {};
      } catch {
        return {};
      }
    };

    const saveKnownStatuses = (map: Record<string, OrderStatus>) => {
      try {
        localStorage.setItem(KNOWN_STATUSES_KEY, JSON.stringify(map));
      } catch {
        // ignore
      }
    };

    const checkOrderStatusChanges = async () => {
      try {
        const allOrders = await fetchDispatchOrders();
        if (!isMounted) return;

        const userEmail = (user.email || '').toLowerCase().trim();
        const userUid = user.uid || '';
        let savedPhone = '';
        try {
          const rawCust = localStorage.getItem('torqmax_saved_customer_v1');
          if (rawCust) {
            const parsed = JSON.parse(rawCust);
            savedPhone = (parsed.phone || '').replace(/\D/g, '');
          }
        } catch {
          // ignore
        }

        // Only monitor orders belonging to this customer
        const customerOrders = allOrders.filter(o => {
          const matchEmail = Boolean(userEmail && o.customerEmail && o.customerEmail.toLowerCase().trim() === userEmail);
          const matchUid = Boolean(userUid && o.customerUid && o.customerUid === userUid);
          const matchPhone = Boolean(savedPhone && o.customer?.phone && o.customer.phone.replace(/\D/g, '').includes(savedPhone));
          return matchEmail || matchUid || matchPhone;
        });

        const known = getKnownStatuses();
        const updatedKnown = { ...known };
        let hasChanges = false;

        customerOrders.forEach(order => {
          const previousStatus = known[order.id];

          if (previousStatus && previousStatus !== order.status) {
            // STATUS TRANSITION DETECTED!
            if (order.status === 'dispatched') {
              notify({
                title: '🚚 Order Dispatched!',
                message: `Your TorqMax order #${order.id} has been dispatched${order.transportName ? ` via ${order.transportName}` : ''}! It is on the way.`,
                type: 'order_dispatched',
                orderId: order.id,
              });
            } else if (order.status === 'delivered') {
              notify({
                title: '✅ Order Delivered!',
                message: `Your TorqMax order #${order.id} has been delivered! Thank you for choosing TorqMax.`,
                type: 'order_delivered',
                orderId: order.id,
              });
            } else if (order.status === 'confirmed' && previousStatus === 'new') {
              notify({
                title: '🟢 Order In Crafting!',
                message: `Your TorqMax order #${order.id} is confirmed and in custom laser crafting.`,
                type: 'info',
                orderId: order.id,
              });
            }
          }

          if (previousStatus !== order.status) {
            updatedKnown[order.id] = order.status;
            hasChanges = true;
          }
        });

        if (hasChanges) {
          saveKnownStatuses(updatedKnown);
        }
      } catch (err) {
        console.warn('Order status watcher notice:', err);
      }
    };

    // Run immediately on user change
    checkOrderStatusChanges();

    // Check periodically every 5 seconds
    const interval = setInterval(checkOrderStatusChanges, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [user, notify]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        activeToast,
        isDrawerOpen,
        permissionStatus,
        notify,
        dismissToast,
        openDrawer,
        closeDrawer,
        markAsRead,
        markAllAsRead,
        clearAll,
        requestNativePermission,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextValue => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return ctx;
};
