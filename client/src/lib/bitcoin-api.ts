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
  try {
    const response = await fetch('/api/market/bitcoin', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);
    throw new Error('Failed to fetch Bitcoin price');
  }
};

export const fetchPriceHistory = async (days: string = "30"): Promise<PriceHistoryPoint[]> => {
  try {
    const response = await fetch(`/api/market/bitcoin/history?days=${days}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching price history:', error);
    throw new Error('Failed to fetch price history');
  }
};

export const fetchFearGreedIndex = async (): Promise<FearGreedIndex> => {
  try {
    const response = await fetch('/api/fear-greed', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Fear & Greed index:', error);
    throw new Error('Failed to fetch Fear & Greed index');
  }
};
