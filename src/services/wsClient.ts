import { getCurrentConfig } from '@/config/hyperliquid';

export interface TradeData {
  coin: string;
  side: 'buy' | 'sell';
  px: string;
  sz: string;
  time: number;
}

export interface OrderBookLevel {
  px: string;
  sz: string;
}

export interface OrderBookData {
  coin: string;
  levels: {
    bids: OrderBookLevel[];
    asks: OrderBookLevel[];
  };
}

class WSClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private subscriptions = new Set<string>();
  private listeners = new Map<string, Set<(data: unknown) => void>>();

  constructor() {
    const config = getCurrentConfig();
    this.url = config.wsUrl;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.ws = null;
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      setTimeout(() => {
        this.connect().catch(console.error);
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private handleMessage(data: Record<string, unknown>) {
    if (data.channel === 'trades') {
      this.notifyListeners('trades', data.data);
    } else if (data.channel === 'l2Book') {
      this.notifyListeners('orderbook', data.data);
    } else if (data.channel === 'allMids') {
      this.notifyListeners('prices', data.data);
    }
  }

  private notifyListeners(type: string, data: unknown) {
    const listeners = this.listeners.get(type);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('Error in WebSocket listener:', error);
        }
      });
    }
  }

  subscribeTrades(coin: string) {
    if (!this.isConnected()) {
      console.warn('WebSocket not connected, cannot subscribe to trades');
      return;
    }

    const subscription = `trades:${coin}`;
    if (!this.subscriptions.has(subscription)) {
      this.ws?.send(JSON.stringify({
        method: 'subscribe',
        subscription: { type: 'trades', coin }
      }));
      this.subscriptions.add(subscription);
    }
  }

  subscribeOrderBook(coin: string) {
    if (!this.isConnected()) {
      console.warn('WebSocket not connected, cannot subscribe to orderbook');
      return;
    }

    const subscription = `l2Book:${coin}`;
    if (!this.subscriptions.has(subscription)) {
      this.ws?.send(JSON.stringify({
        method: 'subscribe',
        subscription: { type: 'l2Book', coin }
      }));
      this.subscriptions.add(subscription);
    }
  }

  subscribePrices() {
    if (!this.isConnected()) {
      console.warn('WebSocket not connected, cannot subscribe to prices');
      return;
    }

    const subscription = 'allMids';
    if (!this.subscriptions.has(subscription)) {
      this.ws?.send(JSON.stringify({
        method: 'subscribe',
        subscription: { type: 'allMids' }
      }));
      this.subscriptions.add(subscription);
    }
  }

  unsubscribe(coin: string, type: 'trades' | 'l2Book' = 'trades') {
    if (!this.isConnected()) {
      return;
    }

    const subscription = `${type}:${coin}`;
    if (this.subscriptions.has(subscription)) {
      this.ws?.send(JSON.stringify({
        method: 'unsubscribe',
        subscription: { type, coin }
      }));
      this.subscriptions.delete(subscription);
    }
  }

  addListener(type: string, listener: (data: unknown) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)?.add(listener);
  }

  removeListener(type: string, listener: (data: unknown) => void) {
    this.listeners.get(type)?.delete(listener);
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
    this.listeners.clear();
  }
}

let wsClientInstance: WSClient | null = null;

export function getWSClient(): WSClient {
  if (!wsClientInstance) {
    wsClientInstance = new WSClient();
  }
  return wsClientInstance;
}
