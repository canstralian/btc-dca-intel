import { useQuery } from "@tanstack/react-query";
import { fetchBitcoinPrice, fetchPriceHistory, fetchFearGreedIndex } from "@/lib/bitcoin-api";

export function useBitcoinPrice() {
  return useQuery({
    queryKey: ["/api/market/bitcoin"],
    queryFn: fetchBitcoinPrice,
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 25000, // Consider data stale after 25 seconds
  });
}

export function usePriceHistory(days: string = "30") {
  return useQuery({
    queryKey: ["/api/market/bitcoin/history", days],
    queryFn: () => fetchPriceHistory(days),
    refetchInterval: 300000, // Refetch every 5 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    staleTime: 240000, // Consider data stale after 4 minutes
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
