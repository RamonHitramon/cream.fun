'use client';

import React from 'react';
import { useNotifications } from './Notification';
import { Notification } from './Notification';

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { notifications, removeNotification } = useNotifications();

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
