'use client';

import React, { useState } from 'react';
import { Card } from '@/features/ui/Card';
import { useWalletConnection } from '@/lib/wallet/useWalletAdapter';
import { useWalletAdapter } from '@/lib/wallet/useWalletAdapter';
import { getCurrentConfig } from '@/config/hyperliquid';

interface DiagnosticResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'PENDING';
  message: string;
  details?: Record<string, unknown>;
}

export default function DiagnosticsPage() {
  const { isConnected, address, chainId } = useWalletConnection();
  const walletAdapter = useWalletAdapter();
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const config = getCurrentConfig();

  const runDiagnostics = async () => {
    setIsRunning(true);
    const newResults: DiagnosticResult[] = [];

    // A. Wallet Connect
    try {
      if (!isConnected || !address) {
        newResults.push({
          name: 'A. Wallet Connect',
          status: 'FAIL',
          message: 'Wallet not connected'
        });
      } else {
        newResults.push({
          name: 'A. Wallet Connect',
          status: 'PASS',
          message: `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`,
          details: { address, chainId }
        });
      }
    } catch (error) {
      newResults.push({
        name: 'A. Wallet Connect',
        status: 'FAIL',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // B. Test Sign Message
    try {
      if (walletAdapter) {
        const signature = await walletAdapter.signMessage('Hyperliquid Test');
        newResults.push({
          name: 'B. Test Sign Message',
          status: 'PASS',
          message: 'Message signed successfully',
          details: { signature: signature.slice(0, 20) + '...' }
        });
      } else {
        newResults.push({
          name: 'B. Test Sign Message',
          status: 'FAIL',
          message: 'Wallet adapter not available'
        });
      }
    } catch (error) {
      newResults.push({
        name: 'B. Test Sign Message',
        status: 'FAIL',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // C. REST /info
    try {
      const response = await fetch(config.infoUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'meta' })
      });
      
      if (response.ok) {
        const data = await response.json();
        newResults.push({
          name: 'C. REST /info',
          status: 'PASS',
          message: `API responded with ${data.universe?.length || 0} assets`,
          details: { status: response.status, assetCount: data.universe?.length }
        });
      } else {
        newResults.push({
          name: 'C. REST /info',
          status: 'FAIL',
          message: `HTTP ${response.status}: ${response.statusText}`
        });
      }
    } catch (error) {
      newResults.push({
        name: 'C. REST /info',
        status: 'FAIL',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // D. WebSocket (simulated)
    try {
      // Simulate WebSocket test for now
      newResults.push({
        name: 'D. WebSocket',
        status: 'PENDING',
        message: 'WebSocket test not implemented yet'
      });
    } catch (error) {
      newResults.push({
        name: 'D. WebSocket',
        status: 'FAIL',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // E. Dry-run /exchange
    try {
      const testOrder = {
        type: 'order',
        orders: [{ 
          a: 'BTC', 
          b: 'buy', 
          t: 'limit', 
          p: '63000', 
          s: '0.01', 
          ro: false 
        }]
      };

      const response = await fetch(config.exchangeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testOrder)
      });

      // We expect an error (no auth), but that confirms the endpoint works
      newResults.push({
        name: 'E. Dry-run /exchange',
        status: 'PASS',
        message: `Endpoint responded (expected error without auth)`,
        details: { status: response.status, statusText: response.statusText }
      });
    } catch (error) {
      newResults.push({
        name: 'E. Dry-run /exchange',
        status: 'FAIL',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    setResults(newResults);
    setIsRunning(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS': return 'text-green-600';
      case 'FAIL': return 'text-red-600';
      case 'PENDING': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-hl-text)' }}>
        Hyperliquid Integration Diagnostics
      </h1>

      <div className="mb-6">
        <Card>
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-hl-text)' }}>
              Current Configuration
            </h2>
            <div className="space-y-2 text-sm">
              <div><strong>Environment:</strong> {config.infoUrl.includes('testnet') ? 'Testnet' : 'Mainnet'}</div>
              <div><strong>Info URL:</strong> {config.infoUrl}</div>
              <div><strong>Exchange URL:</strong> {config.exchangeUrl}</div>
              <div><strong>Chain ID:</strong> {config.chainId}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="mb-6">
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="px-6 py-3 bg-hl-primary text-white rounded-lg font-medium disabled:opacity-50"
        >
          {isRunning ? 'Running...' : 'Run Diagnostics'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((result, index) => (
            <Card key={index}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold" style={{ color: 'var(--color-hl-text)' }}>
                    {result.name}
                  </h3>
                  <span className={`font-bold ${getStatusColor(result.status)}`}>
                    {result.status}
                  </span>
                </div>
                <p className="text-sm mb-2" style={{ color: 'var(--color-hl-muted)' }}>
                  {result.message}
                </p>
                {result.details && (
                  <details className="text-xs">
                    <summary className="cursor-pointer" style={{ color: 'var(--color-hl-muted)' }}>
                      Show Details
                    </summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
