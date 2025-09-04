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

/**
 * 태그(string[]) 역인덱스를 구성한다.
 * tag → Set<productId>
 * @param products Product 배열
 * @returns tag → productId Set
 */
export const buildTagIndex = (products: readonly Product[]) => {
  const m = new Map<string, Set<number>>();
  for (const p of products) {
    if (!Array.isArray(p.tags)) continue;
    for (const raw of p.tags) {
      const tag = (raw ?? '').trim();
      if (!tag) continue;
      if (!m.has(tag)) m.set(tag, new Set<number>());
      m.get(tag)!.add(p.productId);
    }
  }
  return m;
};

/**
 * 제품(Product) 관련 역인덱스 번들을 한 번에 구성한다.
 * 포함: byPublisher/byGenre/byStatus/byCategory/byTag/pIndex
 * @param products Product 배열
 * @returns 인덱스 번들 + pIndex(productId → Product)
 */
export const buildIndexes = (products: readonly Product[]) => ({
  byPublisher: buildIndexBy(products, (p) => p.publisher),
  byGenre: buildIndexBy(products, (p) => p.genre),
  byStatus: buildIndexBy(products, (p) => p.status),
  byCategory: buildIndexBy(products, (p) => p.category),
  byTag: buildTagIndex(products),
  pIndex: new Map(products.map((p) => [p.productId, p] as const)),
});
