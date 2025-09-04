'use client';

import React, { useState } from 'react';
import { Card } from '@/features/ui/Card';
import { generateAgent, saveAgentEncrypted, type AgentKey } from '@/services/agent';
import { validatePin } from '@/utils/crypto';

interface SetupAgentProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (agentKey: AgentKey) => void;
}

export function SetupAgent({ isOpen, onClose, onSuccess }: SetupAgentProps) {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [agentName, setAgentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'pin' | 'confirm' | 'generating'>('pin');

  if (!isOpen) return null;

  const handlePinSubmit = () => {
    if (!validatePin(pin)) {
      setError('PIN must be at least 6 digits and contain only numbers');
      return;
    }
    setStep('confirm');
    setError('');
  };

  const handleConfirmSubmit = () => {
    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }
    setStep('generating');
    setError('');
    generateAgentKey();
  };

  const generateAgentKey = async () => {
    try {
      setLoading(true);
      setError('');

      // Generate new agent key
      const agentKey = await generateAgent();
      
      // Save encrypted key
      await saveAgentEncrypted({ priv: agentKey.priv }, pin);
      
      console.log('[HL] Agent key generated and saved:', agentKey.pub.slice(0, 20) + '...');
      
      onSuccess(agentKey);
      handleClose();
    } catch (error) {
      console.error('[HL] Failed to generate agent key:', error);
      setError(`Failed to generate agent key: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setStep('pin');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPin('');
    setConfirmPin('');
    setAgentName('');
    setError('');
    setStep('pin');
    setLoading(false);
    onClose();
  };

  const renderPinStep = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-hl-text)' }}>
          Agent Name (Optional)
        </label>
        <input
          type="text"
          value={agentName}
          onChange={(e) => setAgentName(e.target.value)}
          placeholder="My Trading Agent"
          className="w-full px-3 py-2 rounded-lg border"
          style={{
            backgroundColor: 'var(--color-hl-surface)',
            borderColor: 'var(--color-hl-border)',
            color: 'var(--color-hl-text)'
          }}
        />
      </div>

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
        />
        <p className="text-xs mt-1" style={{ color: 'var(--color-hl-muted)' }}>
          PIN must be at least 6 alphanumeric characters
        </p>
      </div>

      <button
        onClick={handlePinSubmit}
        disabled={!pin || pin.length < 6}
        className="w-full px-4 py-2 bg-hl-primary text-white rounded-lg font-medium disabled:opacity-50"
      >
        Continue
      </button>
    </div>
  );

  const renderConfirmStep = () => (
    <div className="space-y-4">
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
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setStep('pin')}
          className="flex-1 px-4 py-2 bg-hl-surface border border-hl-border rounded-lg font-medium"
          style={{ color: 'var(--color-hl-text)' }}
        >
          Back
        </button>
        <button
          onClick={handleConfirmSubmit}
          disabled={!confirmPin || confirmPin !== pin}
          className="flex-1 px-4 py-2 bg-hl-primary text-white rounded-lg font-medium disabled:opacity-50"
        >
          Generate Agent Key
        </button>
      </div>
    </div>
  );

  const renderGeneratingStep = () => (
    <div className="text-center space-y-4">
      <div className="animate-spin w-8 h-8 border-4 border-hl-primary border-t-transparent rounded-full mx-auto"></div>
      <p style={{ color: 'var(--color-hl-text)' }}>
        Generating secure agent key...
      </p>
      <p className="text-sm" style={{ color: 'var(--color-hl-muted)' }}>
        This may take a few seconds
      </p>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 'pin':
        return renderPinStep();
      case 'confirm':
        return renderConfirmStep();
      case 'generating':
        return renderGeneratingStep();
      default:
        return renderPinStep();
    }
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

          {renderStep()}

          {step === 'pin' && (
            <div className="mt-4 text-center">
              <button
                onClick={handleClose}
                className="text-sm text-hl-muted hover:text-hl-text"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
