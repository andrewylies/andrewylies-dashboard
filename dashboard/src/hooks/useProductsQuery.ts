import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/api';
import type { Meta, Product } from '@/types/api';

/**
 * 작품 데이터를 불러오는 React Query 훅
 */

export const useProductsQuery = () =>
  useQuery<Meta[], Error, Product[]>({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    select: (raw) =>
      raw.map((data) => ({
        ...data,
        tags: data.tags.split(','),
      })),
  });
