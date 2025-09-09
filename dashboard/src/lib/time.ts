import { lowerBound, upperBound } from '@/lib/search.ts';

/** salesDate(YYYY-MM-DD) 기준 오름차순 정렬 */
export const sortSalesByDate = <T extends { salesDate: string }>(
  rows: readonly T[]
) => {
  const sorted = [...rows].sort((a, b) =>
    a.salesDate < b.salesDate ? -1 : a.salesDate > b.salesDate ? 1 : 0
  );
  const dates = sorted.map((s) => s.salesDate);
  return { sorted, dates };
};

/**
 * [start, end] 범위만 슬라이스 (포함 범위)
 * start/end가 없으면 최소/최대 사용
 */
export const sliceByDate = <T extends { salesDate: string }>(
  sorted: readonly T[],
  dates: readonly string[],
  start?: string,
  end?: string
) => {
  if (!start && !end) return sorted;
  const s = start ?? '0001-01-01';
  const e = end ?? '9999-12-31';
  const i = lowerBound(dates, s);
  const j = upperBound(dates, e);
  return sorted.slice(i, j);
};

import dayjs from 'dayjs';

/** 입력값을 'YYYY-MM-DD' 문자열로 변환 */
export const formatDateYMD = (input?: dayjs.ConfigType): string => {
  return dayjs(input).format('YYYY-MM-DD');
};
