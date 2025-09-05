import dayjs from 'dayjs';

export const DEFAULT_PRESET_KEY = '30d';

export const DATE_FORMAT = 'YYYY-MM-DD';

export const PRESET_RANGES = [
  {
    key: '7d',
    label: '7일',
    get: () => {
      const end = dayjs();
      const start = end.subtract(6, 'day'); // 오늘 포함 7일
      return {
        start: start.format(DATE_FORMAT),
        end: end.format(DATE_FORMAT),
      };
    },
  },
  {
    key: '14d',
    label: '14일',
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
    label: '1개월',
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
    label: '3개월',
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
