import type { FilterKey, FilterOption } from '@/types';

export const FILTER_LABELS = {
  publisher: '출판사',
  genre: '장르',
  status: '상태',
  category: '카테고리',
  tags: '태그',
};

export const STATUS_LABELS: Record<string, string> = {
  A: '연재중',
  I: '휴재',
  S: '연재종료',
};

export const MULTI_KEYS = Object.keys(FILTER_LABELS) as FilterKey[];

export const ALL: FilterOption = { value: 'all', label: '전체' };
