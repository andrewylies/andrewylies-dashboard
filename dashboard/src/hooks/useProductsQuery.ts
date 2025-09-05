import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/api';
import type { Meta, Product } from '@/types/api';

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
