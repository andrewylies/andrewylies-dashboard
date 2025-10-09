import { useMemo } from 'react';
import { notFound } from '@tanstack/react-router';
import { useSalesQuery } from '@/hooks/useSalesQuery';
import { useProductsQuery } from '@/hooks/useProductsQuery';
import { ERROR_CODES } from '@/constants';
import type { ChartProps, DashboardSearch } from '@/types';
import type { Sales } from '@/types/api/sales';
import { buildIndexBy } from '@/lib/indexers';
import { makeCandidates, type IndexBundle } from '@/lib/search';

/**
 * 공통 차트 훅
 */
export const useChartCommon = (search: DashboardSearch): ChartProps => {
  const {
    data: sales = [],
    isPending: isSalesPending,
    isError: isSalesError,
  } = useSalesQuery();
  const {
    data: products = [],
    isPending: isProductsPending,
    isError: isProductsError,
  } = useProductsQuery();

  if (isSalesError || isProductsError) {
    throw notFound({ data: ERROR_CODES.SERVER_ERROR, throw: true });
  }

  // 기간 확정
  const { start, end } = useMemo(() => {
    if (search.start && search.end)
      return { start: search.start, end: search.end };

    // 기본 날짜: 2025년 8월 4일 ~ 8월 24일
    const fallback = {
      start: '2025-08-04',
      end: '2025-08-24',
    };

    return {
      start: search.start ?? fallback.start,
      end: search.end ?? fallback.end,
    };
  }, [search.start, search.end]);

  // 제품 인덱스
  const indexBundle: IndexBundle | undefined = useMemo(() => {
    if (!products.length) return undefined;

    const byPublisher = buildIndexBy(products, (p) => p.publisher);
    const byGenre = buildIndexBy(products, (p) => p.genre);
    const byStatus = buildIndexBy(products, (p) => p.status);
    const byCategory = buildIndexBy(products, (p) => p.category);

    const byTag = new Map<string, Set<number>>();
    for (const p of products) {
      const tags: readonly string[] = p.tags ?? [];
      for (let i = 0; i < tags.length; i++) {
        const t = tags[i];
        let bucket = byTag.get(t);
        if (!bucket) {
          bucket = new Set<number>();
          byTag.set(t, bucket);
        }
        bucket.add(p.productId);
      }
    }

    return { byPublisher, byGenre, byStatus, byCategory, byTag };
  }, [products]);

  // 플랫폼
  const platform =
    search.platform === 'web' || search.platform === 'app'
      ? search.platform
      : undefined;
  const getVal = useMemo<ChartProps['getVal']>(() => {
    if (platform === 'web') return (s: Sales) => s.webSales;
    if (platform === 'app') return (s: Sales) => s.appSales;
    return (s: Sales) => s.totalSales;
  }, [platform]);

  // 제품 후보
  const candidates: Set<number> | undefined = useMemo(() => {
    if (!indexBundle) return undefined;
    return makeCandidates(search, indexBundle);
  }, [search, indexBundle]);

  return {
    isPending: isSalesPending || isProductsPending,
    start,
    end,
    sales,
    products,
    indexBundle,
    candidates,
    getVal,
  };
};
