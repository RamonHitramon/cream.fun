'use client';

import React from 'react';
import { useNotifications } from './Notification';
import { Notification } from './Notification';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { notifications, removeNotification } = useNotifications();

  // В production используем простую версию
  if (process.env.NODE_ENV === 'production') {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      {notifications.map((notification, index) => (
        <Notification
          key={index}
          {...notification}
          onClose={() => removeNotification(index)}
        />
      ))}
    </>
  );
}
