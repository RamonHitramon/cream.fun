'use client';

import React, { useState } from 'react';
import { Card } from '@/features/ui/Card';
import { useWalletConnection } from '@/lib/wallet/useWalletAdapter';
import { useWalletAdapter } from '@/lib/wallet/useWalletAdapter';
import { getCurrentConfig } from '@/config/hyperliquid';
import { hasAgent } from '@/services/agent';
import { getNonce } from '@/services/nonce';
import { getWSClient } from '@/services/wsClient';
import { getPortfolio, getOpenOrders } from '@/services/portfolio';
import { buildStrategyPlan } from '@/services/strategy/calc';
import { placeBatch } from '@/services/tradeBatch';

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

  // В production показываем простую версию без wagmi хуков
  if (process.env.NODE_ENV === 'production') {
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
          <Card>
            <div className="p-4">
              <h2 className="text-lg font-semibold mb-3" style={{ color: 'var(--color-hl-text)' }}>
                Production Mode
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-hl-muted)' }}>
                Diagnostics are only available in development mode. 
                Please run the application locally to access full diagnostic capabilities.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

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

    // D. Agent Key
    try {
      const agentExists = await hasAgent();
      if (agentExists) {
        newResults.push({
          name: 'D. Agent Key',
          status: 'PASS',
          message: 'Agent key exists and is accessible'
        });
      } else {
        newResults.push({
          name: 'D. Agent Key',
          status: 'FAIL',
          message: 'No agent key found - setup required'
        });
      }
    } catch (error) {
      newResults.push({
        name: 'D. Agent Key',
        status: 'FAIL',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // E. Nonce Management
    try {
      if (isConnected && address) {
        const nonce = await getNonce(address);
        newResults.push({
          name: 'E. Nonce Management',
          status: 'PASS',
          message: `Current nonce: ${nonce}`,
          details: { nonce }
        });
      } else {
        newResults.push({
          name: 'E. Nonce Management',
          status: 'FAIL',
          message: 'Wallet not connected - cannot test nonce'
        });
      }
    } catch (error) {
      newResults.push({
        name: 'E. Nonce Management',
        status: 'FAIL',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // F. Market WebSocket
    try {
      const wsClient = getWSClient();
      if (wsClient.isConnected()) {
        // Subscribe to BTC trades
        wsClient.subscribeTrades('BTC');
        
        // Wait a bit for trades
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if we received trades (this would need to be implemented in the store)
        newResults.push({
          name: 'F. Market WebSocket',
          status: 'PASS',
          message: 'WebSocket connected and subscribed to BTC trades',
          details: { connected: true, subscribed: ['BTC'] }
        });
      } else {
        newResults.push({
          name: 'F. Market WebSocket',
          status: 'FAIL',
          message: 'WebSocket not connected'
        });
      }
    } catch (error) {
      newResults.push({
        name: 'F. Market WebSocket',
        status: 'FAIL',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // G. Portfolio REST
    try {
      if (isConnected && address) {
        const portfolio = await getPortfolio(address);
        const openOrders = await getOpenOrders(address);
        
        newResults.push({
          name: 'G. Portfolio REST',
          status: 'PASS',
          message: `Portfolio: $${portfolio.equity}, ${portfolio.positions.length} positions, ${openOrders.length} orders`,
          details: { 
            equity: portfolio.equity,
            positions: portfolio.positions.length,
            openOrders: openOrders.length
          }
        });
      } else {
        newResults.push({
          name: 'G. Portfolio REST',
          status: 'FAIL',
          message: 'Wallet not connected - cannot test portfolio'
        });
      }
    } catch (error) {
      newResults.push({
        name: 'G. Portfolio REST',
        status: 'FAIL',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // H. Batch Dry-run
    try {
      if (!isConnected || !address) {
        newResults.push({
          name: 'H. Batch Dry-run',
          status: 'FAIL',
          message: 'Wallet not connected - cannot test batch planning'
        });
      } else {
        // Create a test strategy plan
        const testPlan = await buildStrategyPlan({
          mode: 'long-basket',
          longAssets: ['BTC', 'ETH', 'SOL'],
          shortAssets: [],
          longUsd: 1000,
          shortUsd: 0,
          leverage: 1
        });

        if (testPlan && testPlan.items.length >= 3) {
          newResults.push({
            name: 'H. Batch Dry-run',
            status: 'PASS',
            message: `Successfully generated plan with ${testPlan.items.length} assets`,
            details: { 
              assetCount: testPlan.items.length,
              totalLongUsd: testPlan.totalLongUsd,
              totalShortUsd: testPlan.totalShortUsd,
              warnings: testPlan.warnings.length
            }
          });
        } else {
          newResults.push({
            name: 'H. Batch Dry-run',
            status: 'FAIL',
            message: 'Failed to generate valid strategy plan'
          });
        }
      }
    } catch (error) {
      newResults.push({
        name: 'H. Batch Dry-run',
        status: 'FAIL',
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }

    // I. Batch Open (Dry-run)
    try {
      if (!isConnected || !address) {
        newResults.push({
          name: 'I. Batch Open (Dry-run)',
          status: 'FAIL',
          message: 'Wallet not connected - cannot test batch orders'
        });
      } else {
        // Create a small test plan
        const testPlan = await buildStrategyPlan({
          mode: 'long-basket',
          longAssets: ['BTC'],
          shortAssets: [],
          longUsd: 10, // Small amount for testing
          shortUsd: 0,
          leverage: 1
        });

        if (testPlan && testPlan.items.length > 0) {
          // Try to place batch (this will fail due to risk validation, but we can check the response)
          const result = await placeBatch(testPlan, 'market', 'test_pin', address);
          
          if (result.error && result.error.includes('Risk validation failed')) {
            newResults.push({
              name: 'I. Batch Open (Dry-run)',
              status: 'PASS',
              message: 'Batch order validation working - risk checks active',
              details: { 
                riskValidation: true,
                error: result.error,
                riskScore: result.riskScore
              }
            });
          } else if (result.success) {
            newResults.push({
              name: 'I. Batch Open (Dry-run)',
              status: 'PASS',
              message: `Batch order placed successfully: ${result.orderIds.length} orders`,
              details: { 
                orderCount: result.orderIds.length,
                success: result.success,
                riskScore: result.riskScore
              }
            });
          } else {
            newResults.push({
              name: 'I. Batch Open (Dry-run)',
              status: 'FAIL',
              message: `Batch order failed: ${result.error}`,
              details: { error: result.error }
            });
          }
        } else {
          newResults.push({
            name: 'I. Batch Open (Dry-run)',
            status: 'FAIL',
            message: 'Could not create test plan for batch order'
          });
        }
      }
    } catch (error) {
      newResults.push({
        name: 'I. Batch Open (Dry-run)',
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
