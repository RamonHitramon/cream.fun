'use client';

import React, { useState } from 'react';
import { Card } from '@/features/ui/Card';
import { generateAgent, saveAgentEncrypted } from '@/services/agent';
import { validatePin } from '@/utils/crypto';

interface SetupAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (agentKey: { priv: string; address: string }) => void;
}

export function SetupAgentModal({ isOpen, onClose, onSuccess }: SetupAgentModalProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePin(pin)) {
      setError('PIN must be at least 6 digits and contain only numbers');
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    if (!agreedToTerms) {
      setError('You must agree to the terms');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Generate new agent key
      const agentKey = await generateAgent();
      
      // Save encrypted key
      await saveAgentEncrypted({ priv: agentKey.priv }, pin);
      
      console.log('[HL] Agent key generated and saved:', agentKey.pub.slice(0, 20) + '...');
      
      // Return only priv and address as required by ensureAgent
      onSuccess({ 
        priv: agentKey.priv, 
        address: agentKey.address 
      });
      
      handleClose();
    } catch (error) {
      console.error('[HL] Failed to generate agent key:', error);
      setError(`Failed to generate agent key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPin('');
    setConfirmPin('');
    setError('');
    setLoading(false);
    setAgreedToTerms(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--color-hl-text)' }}>
              Setup Agent Key
            </h2>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-hl-muted hover:text-hl-text disabled:opacity-50"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <p className="text-sm" style={{ color: 'var(--color-hl-muted)' }}>
              An agent key allows you to trade on Hyperliquid without connecting your wallet for each transaction.
              Your private key is encrypted with your PIN and stored securely in your browser.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-hl-text)' }}>
                Create PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter 6+ digit PIN"
                className="w-full px-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-hl-surface)',
                  borderColor: 'var(--color-hl-border)',
                  color: 'var(--color-hl-text)'
                }}
                maxLength={20}
                required
              />
              <p className="text-xs mt-1" style={{ color: 'var(--color-hl-muted)' }}>
                PIN must be at least 6 alphanumeric characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-hl-text)' }}>
                Confirm PIN
              </label>
              <input
                type="password"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                placeholder="Re-enter your PIN"
                className="w-full px-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: 'var(--color-hl-surface)',
                  borderColor: 'var(--color-hl-border)',
                  color: 'var(--color-hl-text)'
                }}
                maxLength={20}
                required
              />
            </div>

            <div className="flex items-start space-x-2">
              <input
                type="checkbox"
                id="agree-terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1"
                required
              />
              <label htmlFor="agree-terms" className="text-sm" style={{ color: 'var(--color-hl-text)' }}>
                I understand that the private key is stored locally in encrypted form
              </label>
            </div>

            <button
              type="submit"
              disabled={!pin || !confirmPin || !agreedToTerms || loading}
              className="w-full px-4 py-2 bg-hl-primary text-white rounded-lg font-medium disabled:opacity-50"
            >
              {loading ? 'Creating Key...' : 'Create Key'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={handleClose}
              className="text-sm text-hl-muted hover:text-hl-text"
            >
              Cancel
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
