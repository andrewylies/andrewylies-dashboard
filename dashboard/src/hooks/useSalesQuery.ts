import { useQuery } from '@tanstack/react-query';
import { fetchSales } from '@/api';
import type { Sales } from '@/types/api';

export const useSalesQuery = () =>
  useQuery<Sales[]>({
    queryKey: ['sales'],
    queryFn: fetchSales,
    refetchInterval: Infinity,
  });
