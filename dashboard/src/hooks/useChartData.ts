import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import { notFound } from '@tanstack/react-router';
import { DEFAULT_PRESET_KEY, PRESET_RANGES } from '@/constants/date';
import { ERROR_CODES, STACK_MAX_LENGTH } from '@/constants';
import {
  makeSalesLineOption,
  makeSalesStackOption,
  STACKED_BAR_SCALE_SET,
} from '@/constants/chart';
import { useSalesQuery } from '@/hooks/useSalesQuery';
import { useProductsQuery } from '@/hooks/useProductsQuery';
import type { DashboardSearch } from '@/types';
import type { Sales } from '@/types/api/sales';
import { sortSalesByDate, sliceByDate, formatDateYMD } from '@/lib/time';
import { makeCandidates, type IndexBundle } from '@/lib/search';
import { buildIndexBy } from '@/lib/indexers';
import { niceCeil } from '@/lib/format';
import dayjs from 'dayjs';

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

  // 1) 기간 확정

  const { start, end } = useMemo(() => {
    if (search.start && search.end) {
      return { start: search.start, end: search.end };
    }

    const preset = PRESET_RANGES.find((p) => p.key === DEFAULT_PRESET_KEY);
    const fallback = preset
      ? preset.get()
      : (() => {
          const end = dayjs();
          const start = end.subtract(29, 'day');
          return {
            start: formatDateYMD(start),
            end: formatDateYMD(end),
          };
        })();

    return {
      start: search.start ?? fallback.start,
      end: search.end ?? fallback.end,
    };
  }, [search.start, search.end]);

  // 2) 제품 인덱스
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

  // 3) 플랫폼 accessor (루프 전 확정)
  const platform =
    search.platform === 'web' || search.platform === 'app'
      ? search.platform
      : undefined;
  const getVal = useMemo(() => {
    if (platform === 'web') return (s: Sales) => s.webSales;
    if (platform === 'app') return (s: Sales) => s.appSales;
    return (s: Sales) => s.totalSales;
  }, [platform]);

  // 4) 제품 후보 productId
  const candidates: Set<number> | undefined = useMemo(() => {
    if (!indexBundle) return undefined;
    return makeCandidates(search, indexBundle);
  }, [search, indexBundle]);

  // 5) 라인 차트: baseline(필터 무관) + filtered(후보 적용) 동시 집계
  const { dateList, valueList, baselineValueList, yMax } = useMemo(() => {
    if (!sales.length) {
      return {
        dateList: [],
        valueList: [],
        baselineValueList: undefined,
        yMax: 1,
      };
    }

    const { sorted, dates } = sortSalesByDate<Sales>(sales);
    const sliced = sliceByDate<Sales>(sorted, dates, start, end);

    const baseMap = new Map<string, number>();
    const filtMap = new Map<string, number>();
    let maxY = 0;
    const useFilter = !!candidates;

    for (let i = 0; i < sliced.length; i++) {
      const row = sliced[i];
      const key = row.salesDate;
      const val = getVal(row);

      const bacc = (baseMap.get(key) ?? 0) + val;
      baseMap.set(key, bacc);
      if (bacc > maxY) maxY = bacc;

      if (useFilter && candidates!.has(row.productId)) {
        filtMap.set(key, (filtMap.get(key) ?? 0) + val);
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
  }, [sales, start, end, candidates, getVal]);

  // 6) 스택 바(출판사 × 카테고리) 집계
  const { stackCategories, stackStacks, stackMatrix, stackXMax } =
    useMemo(() => {
      if (!sales.length || !products.length) {
        return {
          stackCategories: [],
          stackStacks: [],
          stackMatrix: [],
          stackXMax: 1,
        };
      }

      const meta = new Map<number, { publisher: string; category: string }>();
      for (const p of products) {
        meta.set(p.productId, {
          publisher: p.publisher ?? '기타',
          category: p.category ?? '기타',
        });
      }

      const { sorted, dates } = sortSalesByDate<Sales>(sales);
      const sliced = sliceByDate<Sales>(sorted, dates, start, end);

      const agg = new Map<string, Map<string, number>>();
      const cats = new Set<string>();
      const useFilter = !!candidates;

      for (let i = 0; i < sliced.length; i++) {
        const row = sliced[i];
        if (useFilter && !candidates!.has(row.productId)) continue;

        const m = meta.get(row.productId);
        if (!m) continue;

        const pub = m.publisher || '기타';
        const cat = m.category || '기타';
        const val = getVal(row);

        let pubMap = agg.get(pub);
        if (!pubMap) {
          pubMap = new Map<string, number>();
          agg.set(pub, pubMap);
        }
        pubMap.set(cat, (pubMap.get(cat) ?? 0) + val);
        cats.add(cat);
      }

      if (agg.size === 0) {
        return {
          stackCategories: [],
          stackStacks: [],
          stackMatrix: [],
          stackXMax: 1,
        };
      }

      const stackStacks = Array.from(cats.values()).sort();

      // 출판사 총합 기준 정렬 asc
      const totals: Array<{ pub: string; total: number }> = [];
      for (const [pub, catMap] of agg) {
        let sum = 0;
        for (const v of catMap.values()) sum += v;
        totals.push({ pub, total: sum });
      }
      totals.sort((a, b) => a.total - b.total);

      // 출판사 Max
      const top = totals.slice(0, STACK_MAX_LENGTH);
      const stackCategories = top.map((t) => t.pub);

      // 매트릭스 생성
      const stackMatrix: number[][] = stackStacks.map(() =>
        new Array(stackCategories.length).fill(0)
      );
      let maxX = 0;

      for (let pi = 0; pi < stackCategories.length; pi++) {
        const pub = stackCategories[pi];
        const catMap = agg.get(pub)!;
        let rowSum = 0;
        for (let si = 0; si < stackStacks.length; si++) {
          const cat = stackStacks[si];
          const v = catMap.get(cat) ?? 0;
          stackMatrix[si][pi] = v;
          rowSum += v;
        }
        if (rowSum > maxX) maxX = rowSum;
      }

      return {
        stackCategories,
        stackStacks,
        stackMatrix,
        stackXMax: niceCeil(maxX, STACKED_BAR_SCALE_SET),
      };
    }, [sales, products, candidates, getVal, start, end]);

  // 7) 옵션 생성
  const lineOption: EChartsOption | undefined = useMemo(() => {
    if (dateList.length === 0) return undefined;
    return makeSalesLineOption({
      dateList,
      valueList,
      baselineValueList,
      yMax,
    });
  }, [dateList, valueList, baselineValueList, yMax]);

  const stackOption: EChartsOption | undefined = useMemo(() => {
    if (stackCategories.length === 0) return undefined;
    return makeSalesStackOption({
      categories: stackCategories,
      stacks: stackStacks,
      matrix: stackMatrix,
      xMax: stackXMax,
    });
  }, [stackCategories, stackStacks, stackMatrix, stackXMax]);

  return {
    isPending: isSalesPending || isProductsPending,
    lineOption,
    stackOption,
    dateList,
    valueList,
    start,
    end,
  };
};
