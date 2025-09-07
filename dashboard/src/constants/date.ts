import dayjs from 'dayjs';
import { PAGE_TEXT } from '@/constants/common.ts';

export const DEFAULT_PRESET_KEY = '30d';

export const DATE_FORMAT = 'YYYY-MM-DD';

export const PRESET_RANGES = [
  {
    key: '7d',
    label: PAGE_TEXT.DASHBOARD.FILTER.DAYS.SEVEN_DAYS,
    get: () => {
      const end = dayjs();
      const start = end.subtract(6, 'day');
      return {
        start: start.format(DATE_FORMAT),
        end: end.format(DATE_FORMAT),
      };
    },
  },
  {
    key: '14d',
    label: PAGE_TEXT.DASHBOARD.FILTER.DAYS.FOURTEEN_DAYS,
    get: () => {
      const end = dayjs();
      const start = end.subtract(13, 'day');
      return {
        start: start.format(DATE_FORMAT),
        end: end.format(DATE_FORMAT),
      };
    },
  },
  {
    key: '30d',
    label: PAGE_TEXT.DASHBOARD.FILTER.DAYS.ONE_MONTH,
    get: () => {
      const end = dayjs();
      const start = end.subtract(29, 'day');
      return {
        start: start.format(DATE_FORMAT),
        end: end.format(DATE_FORMAT),
      };
    },
  },
  {
    key: '90d',
    label: PAGE_TEXT.DASHBOARD.FILTER.DAYS.THREE_MONTH,
    get: () => {
      const end = dayjs();
      const start = dayjs().subtract(89, 'day');
      return {
        start: start.format(DATE_FORMAT),
        end: end.format(DATE_FORMAT),
      };
    },
  },
];
