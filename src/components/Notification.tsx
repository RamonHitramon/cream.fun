'use client';

import React from 'react';

export type NotificationType = 'info' | 'warning' | 'error' | 'success';

export interface NotificationProps {
  type: NotificationType;
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

export function Notification({ 
  type, 
  message, 
  onClose, 
  autoClose = true, 
  duration = 5000 
}: NotificationProps) {
  React.useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, onClose, duration]);

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: '✅'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: '⚠️'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: '❌'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: 'ℹ️'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg max-w-sm ${styles.bg} ${styles.border} ${styles.text}`}>
      <div className="flex items-start gap-3">
        <span className="text-lg">{styles.icon}</span>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

// Хук для управления уведомлениями
export function useNotifications() {
  const [notifications, setNotifications] = React.useState<NotificationProps[]>([]);

  const addNotification = (notification: Omit<NotificationProps, 'onClose'>) => {
    const id = Date.now();
    const newNotification: NotificationProps = {
      ...notification,
      onClose: () => removeNotification(id),
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter((_, index) => index !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
  };
}
