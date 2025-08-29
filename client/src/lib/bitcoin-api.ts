export interface BitcoinPrice {
  symbol: string;
  price: string;
  change24h: string;
  changePercent24h: string;
  volume24h: string;
  marketCap: string;
}

export interface PriceHistoryPoint {
  timestamp: string;
  price: number;
}

export interface FearGreedIndex {
  value: number;
  classification: string;
  timestamp: number;
}

export const fetchBitcoinPrice = async (): Promise<BitcoinPrice> => {
  const response = await fetch('/api/market/bitcoin');
  if (!response.ok) {
    throw new Error('Failed to fetch Bitcoin price');
  }
  return response.json();
};

export const fetchPriceHistory = async (days: string = "30"): Promise<PriceHistoryPoint[]> => {
  const response = await fetch(`/api/market/bitcoin/history?days=${days}`);
  if (!response.ok) {
    throw new Error('Failed to fetch price history');
  }
  return response.json();
};

export const fetchFearGreedIndex = async (): Promise<FearGreedIndex> => {
  const response = await fetch('/api/fear-greed');
  if (!response.ok) {
    throw new Error('Failed to fetch Fear & Greed index');
  }
  return response.json();
};
