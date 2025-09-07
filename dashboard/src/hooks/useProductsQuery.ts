import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/api';
import type { Meta, Product } from '@/types/api';

/**
 * 작품 데이터를 불러오는 React Query 훅
 */

export function useProductsQuery() {
  const query = useQuery<Meta[], Error, Product[]>({
    queryKey: ['products'],
    queryFn: fetchProducts,
    select: (raw) =>
      raw.map((data) => ({
        ...data,
        tags: data.tags.split(','),
      })),
  });

  return query;
}
