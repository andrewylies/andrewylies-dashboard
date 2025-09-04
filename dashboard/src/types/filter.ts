import { FILTER_LABELS } from '@/constants';

export type FilterKey = keyof typeof FILTER_LABELS;

export type FilterOption = {
  value: string;
  label: string;
};

export type FilterOptionsMap = Record<FilterKey, FilterOption[]>;

export type DashboardSearch = {
  start?: string;
  end?: string;
} & Partial<Record<FilterKey, string>>;
