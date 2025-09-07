import type { DashboardSearch, FilterKey } from '@/types';

/**
 * 두 Set의 교집합을 구한다.
 * - 성능 최적화를 위해 작은 Set 먼저 순회.
 *
 * @param a 첫 번째 Set (없으면 b 반환)
 * @param b 두 번째 Set (없으면 a 반환)
 * @returns 교집합(Set) 또는 undefined
 */
export const intersect = (a?: Set<number>, b?: Set<number>) => {
  if (!a) return b;
  if (!b) return a;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  const out = new Set<number>();
  for (const v of small) if (large.has(v)) out.add(v);
  return out;
};

/**
 * 역인덱스에서 선택값들의 버킷을 합집합으로 모은다.
 * (publisher/genre/status/category 같은 단일 키 필터에 사용)
 *
 * @param index key → productId 집합으로 매핑된 인덱스
 * @param selected 선택된 key 집합 (없으면 undefined 반환)
 * @returns 선택된 key의 bucket 합집합 (없으면 undefined)
 */
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

/**
 * 역인덱스에서 선택된 태그를 모두 포함하는 교집합을 계산.
 * (tags: 모든 선택 태그를 가진 작품만 필터링)
 *
 * @param index tag → productId 집합으로 매핑된 인덱스
 * @param selected 선택된 tag 집합 (없으면 undefined 반환)
 * @returns 선택된 모든 태그를 포함하는 교집합 (없으면 undefined)
 */
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

/**
 * 검색 파라미터(DashboardSearch)와 인덱스 번들로
 * 최종 후보군(productId Set)을 만든다.
 * - 단일키(publisher/genre/status/category)는 선택값 합집합 → 누적 교집합
 * - tags는 선택된 태그들의 교집합 → 누적 교집합
 * - 어떤 필터도 없으면 undefined 반환(= 전체 허용)
 *
 * @param search DashboardSearch 쿼리 파라미터 (csv 문자열)
 * @param idx 인덱스 번들 (publisher/genre/status/category/tags)
 * @returns productId Set 또는 undefined
 */
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

/**
 * 날짜 필터 칩 객체를 만든다.
 *
 * @param search DashboardSearch (URL 파라미터)
 * @returns [{ key, label }] 또는 null (날짜 미지정 시)
 */
export const buildDateChip = (search: DashboardSearch) => {
  if (!search.start && !search.end) return null;
  const s = search.start ? dayjs(search.start).format(DATE_FORMAT) : '—';
  const e = search.end ? dayjs(search.end).format(DATE_FORMAT) : '—';
  return { key: 'date' as const, label: `${s} ~ ${e}` };
};

/**
 * publisher, genre, status, category, tags 같은 다중 선택 필터에 대한 칩들을 만든다.
 *
 * @param search DashboardSearch (URL 파라미터)
 * @param summarize summarizeCsv 같은 요약 함수
 * @returns [{ key, label }] 배열
 */
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

const mapCsv = (csv: string, dict: Record<string, string>) =>
  csv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => dict[s] ?? s)
    .join(', ');
