import { useMemo } from 'react';
import type { ApiProduct } from '@/types/api';
import type { FilterOption } from '@/types/filter';
import { FILTER_ALL_OPTION } from '@/constants/filter.ts';

export function useFilterOptions(products: ApiProduct[]) {
  return useMemo(() => {
    const publishers = new Set<string>();
    const genres = new Set<string>();
    const statuses = new Set<string>();

    products.forEach((p) => {
      if (p.publisher) publishers.add(p.publisher);
      if (p.genre) genres.add(p.genre);
      if (p.status) statuses.add(p.status);
    });

    const makeOptions = (set: Set<string>): FilterOption[] => [
      FILTER_ALL_OPTION,
      ...Array.from(set).map((val) => ({ value: val, label: val })),
    ];

    return {
      publisher: makeOptions(publishers),
      genre: makeOptions(genres),
      status: makeOptions(statuses),
    };
  }, [products]);
}
