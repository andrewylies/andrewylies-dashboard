import { useQuery } from '@tanstack/react-query';
import { fetchMeta } from '@/api';
import type { ApiMeta } from '@/types/api';

export const useMetaQuery = () =>
  useQuery<ApiMeta[]>({
    queryKey: ['meta'],
    queryFn: fetchMeta,
    staleTime: Infinity,
  });
