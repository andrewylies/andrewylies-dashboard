import { useQuery } from '@tanstack/react-query';
import { fetchSales } from '@/api';
import type { Sales } from '@/types/api';

/**
 * 매출 데이터를 불러오는 React Query 훅
 */

export const useSalesQuery = () =>
  useQuery<Sales[]>({
    queryKey: ['sales'],
    queryFn: fetchSales,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
      staleTime: Infinity,
      gcTime: Infinity,
  });
