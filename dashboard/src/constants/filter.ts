import type { FilterOption } from '@/types';

export const FILTER_LABELS: Record<string, string> = {
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

export const STACK_Y_AXIS_MAX_LENGTH: number = 10;

export const MULTI_KEYS: string[] = Object.keys(FILTER_LABELS);

export const ALL: FilterOption = { value: 'all', label: 'All' };
