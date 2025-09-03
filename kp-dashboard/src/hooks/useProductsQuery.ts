import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMeta } from '@/api';
import type { ApiProduct } from '@/types/api';
import { useFilterStore } from '@/stores/filterStore';

export function useProductsQuery() {
  const setOptions = useFilterStore((s) => s.setOptions);

  const query = useQuery<ApiProduct[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const raw = await fetchMeta();
      return raw.map((data) => ({
        ...data,
        tags: data.tags.split(','),
      }));
    },
    staleTime: Infinity,
  });
  useEffect(() => {
    if (query.data?.length) {
      setOptions(query.data);
    }
  }, [query.data, setOptions]);

  return query;
}
