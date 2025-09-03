import type { FilterKey } from '@/types/filter';

export const LABEL_MAP = {
  publisher: '출판사',
  genre: '장르',
  status: '상태',
} as const satisfies Record<FilterKey, string>;

export const FILTER_LABELS = LABEL_MAP;
export const FILTER_KEYS = Object.keys(LABEL_MAP) as Array<FilterKey>;
export const FILTER_ENTRIES = Object.entries(LABEL_MAP) as ReadonlyArray<
  [FilterKey, string]
>;

export const FILTER_ALL_OPTION = { value: 'all', label: '전체' } as const;
