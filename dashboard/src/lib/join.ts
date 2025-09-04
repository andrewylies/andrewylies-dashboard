/**
 * sales와 product 메타를 조인한다.
 * candidates가 있으면 해당 productId만 허용한다.
 * @param sales 판매 배열
 * @param pIndex productId → Product 매핑
 * @param candidates 허용 productId Set(없으면 전체 허용)
 * @returns [{ sale, meta }] 배열
 */
export const joinSalesWithMeta = <
  S extends { productId: number },
  P extends { productId: number },
>(
  sales: readonly S[],
  pIndex: Map<number, P>,
  candidates?: Set<number>
) => {
  const out: { sale: S; meta: P }[] = [];
  for (const s of sales) {
    if (candidates && !candidates.has(s.productId)) continue;
    const meta = pIndex.get(s.productId);
    if (meta) out.push({ sale: s, meta });
  }
  return out;
};
