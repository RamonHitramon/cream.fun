'use client';
import useSWR from 'swr';

export type PerpMeta = {
  symbol: string;
  maxLeverage?: number;
  szDecimals?: number;
  markPx?: number;
  minOrderUsd?: number;
};
export type PerpMetaMap = Record<string, PerpMeta>;

type MarketsResponse = {
  perps: { symbol:string; maxLeverage?:number; szDecimals?:number; markPx?:number }[];
};

const fetcher = (u: string) => fetch(u).then(r => {
  if (!r.ok) throw new Error('Failed to fetch ' + u);
  return r.json();
});

export function usePerpMetas() {
  const { data, error, isLoading, mutate } = useSWR<MarketsResponse>(
    '/api/hyperliquid/markets',
    fetcher,
    { revalidateOnFocus:false, refreshInterval:60_000 }
  );

  const metas: PerpMetaMap = (data?.perps ?? []).reduce((acc, p) => {
    acc[p.symbol] = {
      symbol: p.symbol,
      maxLeverage: p.maxLeverage,
      szDecimals: p.szDecimals,
      markPx: p.markPx,
      // minOrderUsd можно заполнить позже из реальных правил
    };
    return acc;
  }, {} as PerpMetaMap);

  return { metas, isLoading, error, refresh: () => mutate() };
}
