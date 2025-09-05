import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import { notFound } from '@tanstack/react-router';
import { DEFAULT_PRESET_KEY, PRESET_RANGES } from '@/constants/date';
import { ERROR_CODES } from '@/constants';
import { makeSalesLineOption } from '@/constants/chart';
import { useSalesQuery } from '@/hooks/useSalesQuery';
import { useProductsQuery } from '@/hooks/useProductsQuery';
import type { DashboardSearch } from '@/types';
import type { Sales } from '@/types/api/sales';
import { sortSalesByDate, sliceByDate } from '@/lib/time';
import { makeCandidates, type IndexBundle } from '@/lib/search';
import { buildIndexBy } from '@/lib/indexers';
import { niceCeil } from '@/lib/format';

type ChartMode = 'total' | 'app' | 'web';
const toMode = (v?: string): ChartMode =>
  v === 'app' || v === 'web' ? v : 'total';
const valueSelector = (mode: ChartMode) =>
  mode === 'app'
    ? (s: Sales) => s.appSales
    : mode === 'web'
      ? (s: Sales) => s.webSales
      : (s: Sales) => s.totalSales;

export const useChartData = (search: DashboardSearch) => {
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

  const mode = toMode(search.platform);

  // 1) 기간 확정
  const { start, end } = useMemo(() => {
    if (search.start && search.end)
      return { start: search.start, end: search.end };
    const preset = PRESET_RANGES.find((p) => p.key === DEFAULT_PRESET_KEY);
    const fallback = preset
      ? preset.get()
      : (() => {
          const end = new Date();
          const start = new Date(end);
          start.setDate(end.getDate() - 29);
          const fmt = (d: Date) =>
            `${d.getFullYear().toString().padStart(4, '0')}-${(d.getMonth() + 1)
              .toString()
              .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
          return { start: fmt(start), end: fmt(end) };
        })();
    return {
      start: search.start ?? fallback.start,
      end: search.end ?? fallback.end,
    };
  }, [search.start, search.end]);

  // 2) 인덱스
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

  // 3) 필터 후보 productId
  const candidates: Set<number> | undefined = useMemo(() => {
    if (!indexBundle) return undefined;
    return makeCandidates(search, indexBundle); // 그대로
  }, [search, indexBundle]);

  // 4) baseline + filtered 동시 집계 (슬라이스 한 번만)
  const { dateList, valueList, baselineValueList, yMax } = useMemo(() => {
    if (!sales.length) {
      return {
        dateList: [],
        valueList: [],
        baselineValueList: undefined,
        yMax: 1,
      };
    }

    const pickValue = valueSelector(mode);
    const { sorted, dates } = sortSalesByDate<Sales>(sales);
    const sliced = sliceByDate<Sales>(sorted, dates, start, end);

    // Map 누적(문자열 키: YYYY-MM-DD)
    const baseMap = new Map<string, number>();
    const filtMap = new Map<string, number>();
    let maxY = 0;

    const useFilter = !!candidates;

    for (let i = 0; i < sliced.length; i++) {
      const row = sliced[i];
      const key = row.salesDate;
      const val = pickValue(row);

      const bacc = (baseMap.get(key) ?? 0) + val;
      baseMap.set(key, bacc);
      if (bacc > maxY) maxY = bacc;

      if (useFilter) {
        if (candidates!.has(row.productId)) {
          filtMap.set(key, (filtMap.get(key) ?? 0) + val);
        }
      }
    }

    const x = Array.from(baseMap.keys()).sort();
    const baseline = x.map((d) => baseMap.get(d) ?? 0);
    const filtered = useFilter ? x.map((d) => filtMap.get(d) ?? 0) : baseline;

    return {
      dateList: x,
      valueList: filtered,
      baselineValueList: useFilter ? baseline : undefined,
      yMax: niceCeil(maxY),
    };
  }, [sales, start, end, mode, candidates]);

  // 5) 옵션 생성
  const lineOption: EChartsOption | undefined = useMemo(() => {
    if (dateList.length === 0) return undefined;
    return makeSalesLineOption({
      dateList,
      valueList,
      baselineValueList,
      yMax,
    });
  }, [dateList, valueList, baselineValueList, yMax]);

  return {
    isPending: isSalesPending || isProductsPending,
    lineOption,
    dateList,
    valueList,
    start,
    end,
  };
};
