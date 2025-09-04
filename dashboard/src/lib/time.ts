import type { Dayjs } from 'dayjs';

/**
 * salesDate(YYYY-MM-DD) 기준 오름차순 정렬한다.
 * @param rows 정렬 대상
 * @returns [{ sorted, dates }] (동일 길이의 날짜 문자열 배열 포함)
 */
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
 * target 이상이 처음 나오는 인덱스(lower bound).
 * @param dates 정렬된 날짜 문자열 배열
 * @param target 비교할 날짜 문자열
 * @returns 인덱스
 */
export const lowerBound = (dates: readonly string[], target: string) => {
  let l = 0,
    r = dates.length;
  while (l < r) {
    const m = (l + r) >>> 1;
    if (dates[m] < target) l = m + 1;
    else r = m;
  }
  return l;
};

/**
 * target 초과가 처음 나오는 인덱스(upper bound).
 * @param dates 정렬된 날짜 문자열 배열
 * @param target 비교할 날짜 문자열
 * @returns 인덱스
 */
export const upperBound = (dates: readonly string[], target: string) => {
  let l = 0,
    r = dates.length;
  while (l < r) {
    const m = (l + r) >>> 1;
    if (dates[m] <= target) l = m + 1;
    else r = m;
  }
  return l;
};

/**
 * [start, end] 범위를 슬라이스한다(포함 범위).
 * start/end가 없으면 각각 최소/최대 범위를 사용한다.
 * @param sorted 정렬된 rows
 * @param dates 정렬된 날짜 문자열 배열(sorted와 동일 길이)
 * @param start 시작일(YYYY-MM-DD)
 * @param end 종료일(YYYY-MM-DD)
 * @returns 범위 내 부분 배열
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

/**
 * 프리셋 일치 키를 찾는다.
 * @param start Dayjs | null
 * @param end Dayjs | null
 * @param fmt 날짜 포맷 (예: 'YYYY-MM-DD')
 * @param presets { key: string; get: () => {start: string; end: string} }[]
 * @returns string | null
 */
export const matchPresetKey = (
  start: Dayjs,
  end: Dayjs,
  fmt: string,
  presets: Array<{ key: string; get: () => { start: string; end: string } }>
) => {
  if (!start || !end) return null;
  const s = start.format(fmt);
  const e = end.format(fmt);
  for (const p of presets) {
    const cand = p.get();
    if (cand.start === s && cand.end === e) return p.key;
  }
  return null;
};
