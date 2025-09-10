import { useQuery } from "@tanstack/react-query";
import { fetchBitcoinPrice, fetchPriceHistory, fetchFearGreedIndex } from "@/lib/bitcoin-api";

export function useBitcoinPrice() {
  return useQuery({
    queryKey: ["/api/market/bitcoin"],
    queryFn: fetchBitcoinPrice,
    refetchInterval: 120000, // Refetch every 2 minutes (optimized for 3-min cache)
    retry: 2, // Reduced retries since backend now handles retries
    retryDelay: (attemptIndex) => Math.min(2000 * 2 ** attemptIndex, 15000),
    staleTime: 100000, // Consider data stale after 1.67 minutes
  });
}

export function usePriceHistory(days: string = "30") {
  return useQuery({
    queryKey: ["/api/market/bitcoin/history", days],
    queryFn: () => fetchPriceHistory(days),
    refetchInterval: 600000, // Refetch every 10 minutes (optimized for historical data)
    retry: 2, // Backend now handles retries
    retryDelay: (attemptIndex) => Math.min(3000 * 2 ** attemptIndex, 20000),
    staleTime: 480000, // Consider data stale after 8 minutes
  });
}

export function useFearGreedIndex() {
  return useQuery({
    queryKey: ["/api/fear-greed"],
    queryFn: fetchFearGreedIndex,
    refetchInterval: 3600000, // Refetch every hour
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: 3300000, // Consider data stale after 55 minutes
  });
}
