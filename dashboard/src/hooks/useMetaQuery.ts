import { useQuery } from '@tanstack/react-query';
import { fetchMeta } from '@/api';
import type { Meta } from '@/types/api';

export const useMetaQuery = () =>
  useQuery<Meta[]>({
    queryKey: ['meta'],
    queryFn: fetchMeta,
    staleTime: Infinity,
  });
