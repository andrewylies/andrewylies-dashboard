import type { FilterKey, FilterOption } from '@/types';

export const FILTER_LABELS = {
  publisher: 'Publisher',
  genre: 'Genre',
  status: 'Status',
  category: 'Category',
  tags: 'Tag',
};

export const STATUS_LABELS: Record<string, string> = {
  A: '연재중',
  I: '휴재',
  S: '연재종료',
};

export const MULTI_KEYS = Object.keys(FILTER_LABELS) as FilterKey[];
export const FILTER_KEYS = Object.keys(
  FILTER_LABELS
) as (keyof typeof FILTER_LABELS)[];

export const ALL: FilterOption = { value: 'all', label: 'All' };
