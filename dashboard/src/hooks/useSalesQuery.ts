import { useQuery } from '@tanstack/react-query';
import { fetchSales } from '@/api';
import type { ApiSales } from '@/types/api';

export const useSalesQuery = () =>
  useQuery<ApiSales[]>({
    queryKey: ['sales'],
    queryFn: fetchSales,
    refetchInterval: Infinity,
  });
