import { create } from 'zustand';
import type { FilterOption } from '@/types/filter';
import type { ApiProduct } from '@/types/api';

type Options = {
  publisher: FilterOption[];
  genre: FilterOption[];
  status: FilterOption[];
};

interface FilterState {
  options: Options;
  setOptions: (products: ApiProduct[]) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  options: {
    publisher: [{ value: 'all', label: '전체' }],
    genre: [{ value: 'all', label: '전체' }],
    status: [{ value: 'all', label: '전체' }],
  },
  setOptions: (products) => {
    const norm = (s?: string) => (s ?? '').trim();
    const toOpts = (vals: string[]) => [
      { value: 'all', label: '전체' },
      ...Array.from(new Set(vals.filter(Boolean)))
        .sort()
        .map((v) => ({ value: v, label: v })),
    ];

    const pubs = products.map((p) => norm(p.publisher)).filter(Boolean);
    const genres = products.map((p) => norm(p.genre)).filter(Boolean);
    const stats = products.map((p) => norm(p.status)).filter(Boolean);

    set({
      options: {
        publisher: toOpts(pubs),
        genre: toOpts(genres),
        status: toOpts(stats),
      },
    });
  },
}));
