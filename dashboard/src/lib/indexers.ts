import type { Product } from '@/types/api';

/** Product 배열을 주어진 key 함수 기준으로 역인덱스 생성 */
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
