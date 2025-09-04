import { create } from 'zustand';
import type { FilterKey, FilterOption } from '@/types/filter';
import type { Product } from '@/types/api';
import { ALL, MULTI_KEYS, STATUS_LABELS } from '@/constants';

const toOptions = (
  values: Iterable<string>,
  labelMap?: Record<string, string>
) => {
  const set = new Set<string>();
  for (const v of values) {
    const t = (v ?? '').trim();
    if (t) set.add(t);
  }
  return [
    ALL,
    ...Array.from(set)
      .sort((a, b) => a.localeCompare(b))
      .map((v) => ({ value: v, label: labelMap?.[v] ?? v })),
  ];
};

const emptyOptions = (): Record<FilterKey, FilterOption[]> =>
  Object.fromEntries(MULTI_KEYS.map((k) => [k, [ALL]])) as Record<
    FilterKey,
    FilterOption[]
  >;

type OptionsMap = Record<FilterKey, FilterOption[]>;

interface FilterState {
  options: OptionsMap;
  setOptions: (products: Product[]) => void;
  reset: () => void;
  getOptions: (key: FilterKey) => FilterOption[];
}

export const useFilterStore = create<FilterState>((set, get) => ({
  options: emptyOptions(),

  setOptions: (products) => {
    const publishers = products.map((p) => p.publisher);
    const genres = products.map((p) => p.genre);
    const statuses = products.map((p) => p.status);
    const categories = products.map((p) => p.category);

    const tagsFlat: string[] = [];
    for (const p of products) {
      if (Array.isArray(p.tags)) {
        for (const t of p.tags) tagsFlat.push(t);
      }
    }

    set({
      options: {
        publisher: toOptions(publishers),
        genre: toOptions(genres),
        status: toOptions(statuses, STATUS_LABELS),
        category: toOptions(categories),
        tags: toOptions(tagsFlat),
      },
    });
  },

  reset: () => set({ options: emptyOptions() }),

  getOptions: (key) => get().options[key] ?? [ALL],
}));
