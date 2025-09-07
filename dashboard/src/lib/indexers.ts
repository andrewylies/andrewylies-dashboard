import type { Product } from '@/types/api';

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
