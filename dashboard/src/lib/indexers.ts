import type { Product } from '@/types/api';
import type { FilterKey } from '@/types';
import { FILTER_KEYS } from '@/constants';

/**
 * 지정한 key 함수로 Product 배열을 역인덱싱한다.
 * 예: publisher → 해당 publisher에 속한 productId Set
 * @param rows Product 배열
 * @param keyFn 인덱스 키 추출 함수(예: p => p.publisher)
 * @returns key → productId Set
 */
export const buildIndexBy = (
  rows: readonly Product[],
  keyFn: (row: Product) => string
) => {
  const map = new Map<string, Set<number>>();
  for (const r of rows) {
    const key = keyFn(r).trim();
    if (!map.has(key)) map.set(key, new Set<number>());
    map.get(key)!.add(r.productId);
  }
  return map;
};

/** 여러 Set 교집합 (작은 집합부터) */
function intersectSets<T>(sets: Set<T>[]): Set<T> {
  if (sets.length === 0) return new Set<T>();
  sets.sort((a, b) => a.size - b.size);
  const [first, ...rest] = sets;
  const result = new Set(first);
  for (const s of rest) {
    for (const v of result) {
      if (!s.has(v)) result.delete(v);
    }
    if (result.size === 0) break;
  }
  return result;
}

/** 단일 키 values → 합집합 */
function unionForKey(
  map: Map<string, Set<number>>,
  values: string[]
): Set<number> {
  const out = new Set<number>();
  for (const v of values) {
    const bucket = map.get(v);
    if (!bucket) continue;
    for (const id of bucket) out.add(id);
  }
  return out;
}

/**
 * search 쿼리 + 인덱스(by) + allIds → 후보 productId
 * - 같은 키의 여러 값은 합집합
 * - 키 간에는 교집합
 */
export function pickCandidates(
  search: Partial<Record<FilterKey, string>>,
  by: Record<FilterKey, Map<string, Set<number>>>,
  allIds: Set<number>
): Set<number> {
  const perKeyCandidates: Set<number>[] = [];

  for (const key of FILTER_KEYS) {
    const raw = search[key];
    if (!raw) continue;

    const values = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (values.length === 0) continue;

    const union = unionForKey(by[key], values);
    perKeyCandidates.push(union);
  }

  return perKeyCandidates.length === 0
    ? new Set(allIds)
    : intersectSets(perKeyCandidates);
}
