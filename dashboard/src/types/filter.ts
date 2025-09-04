export type DashboardSearch = {
  start?: string;
  end?: string;
  publisher?: string;
  genre?: string;
  status?: string;
  author?: string;
  channel?: 'all' | 'app' | 'web';
};

export type FilterKey = 'publisher' | 'genre' | 'status';

export type FilterOption = {
  value: string;
  label: string;
};

export interface FilterInputProps {
  type: FilterKey;
  value?: string;
  options: FilterOption[];
  onChange: (val: string) => void;
}
