'use client';

import { useState, useCallback } from 'react';
import { SetupAgentModal } from '@/components/SetupAgentModal';
import { useNotifications } from '@/components/Notification';

interface AgentKey {
  priv: string;
  address: string;
}

export function useAgentSetup() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingResolve, setPendingResolve] = useState<((agent: AgentKey) => void) | null>(null);
  const { addNotification } = useNotifications();

  const ensureAgent = useCallback((): Promise<AgentKey> => {
    return new Promise((resolve) => {
      // Store the resolve function and open modal
      setPendingResolve(() => resolve);
      setIsModalOpen(true);
    });
  }, []);

  const handleModalSuccess = useCallback((agentKey: AgentKey) => {
    // Close modal
    setIsModalOpen(false);
    
    // Resolve the promise
    if (pendingResolve) {
      pendingResolve(agentKey);
      setPendingResolve(null);
    }
    
    // Show success notification
    addNotification({
      type: 'success',
      message: 'Agent key created successfully'
    });
  }, [pendingResolve, addNotification]);

  const handleModalClose = useCallback(() => {
    // Close modal
    setIsModalOpen(false);
    
    // Reject the promise if it was pending
    if (pendingResolve) {
      setPendingResolve(null);
    }
  }, [pendingResolve]);

  const AgentModal = useCallback(() => {
    return (
      <SetupAgentModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
    );
  }, [isModalOpen, handleModalClose, handleModalSuccess]);

  return {
    ensureAgent,
    AgentModal,
    isModalOpen
  };
}
