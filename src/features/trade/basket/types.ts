export type Side = 'BUY' | 'SELL';
export type OrderType = 'market' | 'limit';

export interface BasketInput {
  orderType: OrderType;
  side: Side;
  totalUsd: number;
  symbols: string[];
}

export interface PreparedOrder {
  symbol: string;
  side: Side;
  sz: number;
  price?: number;
}

export interface BasketPreview {
  prepared: PreparedOrder[];
  totalValue: number;
  errors?: string[];
}
