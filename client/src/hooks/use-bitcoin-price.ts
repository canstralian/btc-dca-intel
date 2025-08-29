import { useQuery } from "@tanstack/react-query";
import { fetchBitcoinPrice, fetchPriceHistory, fetchFearGreedIndex } from "@/lib/bitcoin-api";

export function useBitcoinPrice() {
  return useQuery({
    queryKey: ["/api/market/bitcoin"],
    queryFn: fetchBitcoinPrice,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function usePriceHistory(days: string = "30") {
  return useQuery({
    queryKey: ["/api/market/bitcoin/history", days],
    queryFn: () => fetchPriceHistory(days),
    refetchInterval: 300000, // Refetch every 5 minutes
  });
}

export function useFearGreedIndex() {
  return useQuery({
    queryKey: ["/api/fear-greed"],
    queryFn: fetchFearGreedIndex,
    refetchInterval: 3600000, // Refetch every hour
  });
}
