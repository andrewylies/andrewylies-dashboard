import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/api';
import type { Meta, Product } from '@/types/api';
import { useFilterStore } from '@/stores/filterStore';

export function useProductsQuery() {
  const setOptions = useFilterStore((s) => s.setOptions);

  const query = useQuery<Meta[], Error, Product[]>({
    queryKey: ['products'],
    queryFn: fetchProducts,
    select: (raw) =>
      raw.map((data) => ({
        ...data,
        tags: data.tags.split(','),
      })),
  });
  useEffect(() => {
    if (query.data?.length) {
      setOptions(query.data);
    }
  }, [query.data, setOptions]);

  return query;
}
