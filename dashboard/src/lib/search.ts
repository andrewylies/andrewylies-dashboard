import type { DashboardSearch, FilterKey } from '@/types';

/** 정렬된 배열에서 target 이상(>=)이 처음 나타나는 인덱스 */
export const lowerBound = <T extends string | number>(
  arr: readonly T[],
  target: T
): number => {
  let lo = 0,
    hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
};

/** 정렬된 배열에서 target 초과(>)가 처음 나타나는 인덱스 */
export const upperBound = <T extends string | number>(
  arr: readonly T[],
  target: T
): number => {
  let lo = 0,
    hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (arr[mid] <= target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
};

/** 두 Set의 교집합 (없으면 다른 쪽 그대로 반환) */
export const intersect = (a?: Set<number>, b?: Set<number>) => {
  if (!a) return b;
  if (!b) return a;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  const out = new Set<number>();
  for (const v of small) if (large.has(v)) out.add(v);
  return out;
};

/** 역인덱스에서 선택된 key들의 합집합 */
export const unionFromIndex = (
  index: Map<string, Set<number>>,
  selected?: Set<string>
) => {
  if (!selected || selected.size === 0) return undefined;
  const out = new Set<number>();
  for (const key of selected) {
    const bucket = index.get(key);
    if (bucket) for (const id of bucket) out.add(id);
  }
  return out;
};

/** 역인덱스에서 선택된 모든 태그의 교집합 */
export const intersectAllFromIndex = (
  index: Map<string, Set<number>>,
  selected?: Set<string>
) => {
  if (!selected || selected.size === 0) return undefined;
  let acc: Set<number> | undefined = undefined;
  for (const tag of selected) {
    const bucket = index.get(tag);
    if (!bucket) return new Set<number>();
    acc = intersect(acc, bucket);
  }
  return acc;
};

export type IndexBundle = {
  byPublisher: Map<string, Set<number>>;
  byGenre: Map<string, Set<number>>;
  byStatus: Map<string, Set<number>>;
  byCategory: Map<string, Set<number>>;
  byTag: Map<string, Set<number>>;
};

import { csvToSet } from '@/lib';
import dayjs from 'dayjs';
import {
  DATE_FORMAT,
  FILTER_LABELS,
  MULTI_KEYS,
  STATUS_LABELS,
} from '@/constants';

/** 검색 파라미터와 인덱스를 기반으로 후보군(productId Set) 생성 */

export const makeCandidates = (search: DashboardSearch, idx: IndexBundle) => {
  const selPublisher = csvToSet(search.publisher);
  const selGenre = csvToSet(search.genre);
  const selStatus = csvToSet(search.status);
  const selCategory = csvToSet(search.category);
  const selTags = csvToSet(search.tags);

  let acc: Set<number> | undefined = undefined;

  const fold = (index: Map<string, Set<number>>, selected?: Set<string>) => {
    const union = unionFromIndex(index, selected);
    acc = intersect(acc, union);
  };

  fold(idx.byPublisher, selPublisher);
  fold(idx.byGenre, selGenre);
  fold(idx.byStatus, selStatus);
  fold(idx.byCategory, selCategory);

  const tagAll = intersectAllFromIndex(idx.byTag, selTags);
  acc = intersect(acc, tagAll);

  return acc;
};

/** 날짜 범위 필터 칩 생성 */
export const buildDateChip = (search: DashboardSearch) => {
  if (!search.start && !search.end) return null;
  const s = search.start ? dayjs(search.start).format(DATE_FORMAT) : '—';
  const e = search.end ? dayjs(search.end).format(DATE_FORMAT) : '—';
  return { key: 'date' as const, label: `${s} ~ ${e}` };
};

/** 다중 선택 필터 칩 배열 생성 (status는 라벨 매핑 적용) */
export const buildMultiChips = (
  search: DashboardSearch,
  summarize: (label: string, csv: string) => string
) => {
  return MULTI_KEYS.reduce<Array<{ key: FilterKey; label: string }>>(
    (acc, k) => {
      const v = search[k];
      if (!v) return acc;
      const shown = k === 'status' ? mapCsv(v, STATUS_LABELS) : v;

      acc.push({ key: k, label: summarize(FILTER_LABELS[k], shown) });
      return acc;
    },
    []
  );
};

/** CSV 문자열을 매핑 사전으로 치환 후 다시 CSV로 반환 */
const mapCsv = (csv: string, dict: Record<string, string>) =>
  csv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => dict[s] ?? s)
    .join(', ');
