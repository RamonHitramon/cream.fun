'use client';

import React, { useState } from 'react';
import { Card } from '@/features/ui/Card';
import { usePortfolioData } from '@/stores/userData';
import { useWalletConnection } from '@/lib/wallet/useWalletAdapter';

interface BalancePanelProps {
  className?: string;
}

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (amount: string) => void;
}

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: (amount: string) => void;
  withdrawable: string;
}

function DepositModal({ isOpen, onClose, onDeposit }: DepositModalProps) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setIsLoading(true);
    try {
      await onDeposit(amount);
      setAmount('');
      onClose();
    } catch (error) {
      console.error('Deposit failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-hl-text)' }}>
          Deposit Funds
        </h3>
        
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-sm text-yellow-800">
            <div className="font-semibold mb-1">⚠️ Important:</div>
            <div>• Minimum deposit: 5 USDC on Hyperliquid testnet</div>
            <div>• Funds will be available for trading immediately</div>
            <div>• Testnet funds have no real value</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-hl-text)' }}>
              Amount (USDC):
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="5"
              step="0.01"
              className="w-full px-3 py-2 border rounded-lg"
              style={{
                backgroundColor: 'var(--color-hl-surface)',
                borderColor: 'var(--color-hl-border)',
                color: 'var(--color-hl-text)'
              }}
              required
            />
            <div className="text-xs text-hl-muted mt-1">
              Minimum: 5 USDC
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg font-medium"
              style={{
                borderColor: 'var(--color-hl-border)',
                color: 'var(--color-hl-text)'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!amount || Number(amount) < 5 || isLoading}
              className="flex-1 px-4 py-2 bg-hl-primary text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-hl-primary-dark transition-colors"
            >
              {isLoading ? 'Processing...' : 'Deposit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function WithdrawModal({ isOpen, onClose, onWithdraw, withdrawable }: WithdrawModalProps) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    setIsLoading(true);
    try {
      await onWithdraw(amount);
      setAmount('');
      onClose();
    } catch (error) {
      console.error('Withdraw failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const maxAmount = Number(withdrawable);
  const fee = 1; // $1 fee on mainnet

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--color-hl-text)' }}>
          Withdraw Funds
        </h3>
        
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800">
            <div className="font-semibold mb-1">ℹ️ Withdrawal Info:</div>
            <div>• Processing time: 3-5 minutes</div>
            <div>• Withdrawal fee: ${fee} USDC</div>
            <div>• Available: {Number(withdrawable).toFixed(2)} USDC</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-hl-text)' }}>
              Amount (USDC):
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="0.01"
              max={maxAmount}
              step="0.01"
              className="w-full px-3 py-2 border rounded-lg"
              style={{
                backgroundColor: 'var(--color-hl-surface)',
                borderColor: 'var(--color-hl-border)',
                color: 'var(--color-hl-text)'
              }}
              required
            />
            <div className="flex justify-between text-xs text-hl-muted mt-1">
              <span>Available: {maxAmount.toFixed(2)} USDC</span>
              <button
                type="button"
                onClick={() => setAmount(maxAmount.toString())}
                className="text-blue-600 hover:text-blue-800"
              >
                Max
              </button>
            </div>
          </div>

          {amount && Number(amount) > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-sm">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span>${Number(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fee:</span>
                  <span>${fee}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                  <span>Total:</span>
                  <span>${(Number(amount) + fee).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg font-medium"
              style={{
                borderColor: 'var(--color-hl-border)',
                color: 'var(--color-hl-text)'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!amount || Number(amount) <= 0 || Number(amount) > maxAmount || isLoading}
              className="flex-1 px-4 py-2 bg-hl-primary text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-hl-primary-dark transition-colors"
            >
              {isLoading ? 'Processing...' : 'Withdraw'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function BalancePanel({ className = '' }: BalancePanelProps) {
  const { portfolio } = usePortfolioData();
  const { isConnected } = useWalletConnection();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const formatCurrency = (value: string) => {
    const num = Number(value);
    if (isNaN(num)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Calculate margin usage percentage
  const marginUsage = portfolio?.equity !== '0' 
    ? (Number(portfolio?.marginUsed || '0') / Number(portfolio?.equity)) * 100 
    : 0;

  // Calculate withdrawable amount (simplified: equity - margin - buffer)
  const withdrawable = Math.max(0, Number(portfolio?.equity) - Number(portfolio?.marginUsed || '0') - 10);

  const handleDeposit = async (amount: string) => {
    // TODO: Implement actual deposit logic
    console.log('Depositing:', amount);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleWithdraw = async (amount: string) => {
    // TODO: Implement actual withdraw logic using withdraw3
    console.log('Withdrawing:', amount);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  if (!isConnected) {
    return (
      <Card className={className}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-hl-text)' }}>
            Account Balance
          </h3>
          <div className="text-center py-8 text-hl-muted">
            <div className="text-sm">Connect your wallet to view balance</div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-hl-text)' }}>
            Account Balance
          </h3>

          <div className="space-y-4">
            {/* Total Equity */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium" style={{ color: 'var(--color-hl-text)' }}>
                Total Equity
              </span>
              <span className="text-lg font-bold" style={{ color: 'var(--color-hl-text)' }}>
                {formatCurrency(portfolio?.equity || '0')}
              </span>
            </div>

            {/* Perp Balance */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium" style={{ color: 'var(--color-hl-text)' }}>
                Perp Balance
              </span>
              <span className="text-sm" style={{ color: 'var(--color-hl-text)' }}>
                {formatCurrency(portfolio?.equity || '0')}
              </span>
            </div>

            {/* Withdrawable */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium" style={{ color: 'var(--color-hl-text)' }}>
                Withdrawable
              </span>
              <span className="text-sm" style={{ color: 'var(--color-hl-text)' }}>
                {formatCurrency(withdrawable.toString())}
              </span>
            </div>

            {/* Margin Usage */}
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium" style={{ color: 'var(--color-hl-text)' }}>
                Margin Usage
              </span>
              <div className="flex items-center gap-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      marginUsage > 80 ? 'bg-red-500' : 
                      marginUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(marginUsage, 100)}%` }}
                  />
                </div>
                <span className="text-sm" style={{ color: 'var(--color-hl-text)' }}>
                  {formatPercent(marginUsage)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-hl-border">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowDepositModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Deposit
                </button>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  disabled={withdrawable <= 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Modals */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onDeposit={handleDeposit}
      />

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onWithdraw={handleWithdraw}
        withdrawable={withdrawable.toString()}
      />
    </>
  );
}

