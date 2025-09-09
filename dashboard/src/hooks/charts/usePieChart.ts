import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import type { Sales } from '@/types/api/sales';
import { makeGenrePieOption } from '@/constants/charts/pie';
import { CHART_TEXT } from '@/constants';
import type { ChartProps } from '@/types';
import { lowerBound, upperBound } from '@/lib';

export type PieOptions = {
  /** 장르별 매출 비율 */
  sales?: EChartsOption;
  /** 장르별 작품 수 비율 */
  count?: EChartsOption;
};

const PIE_BASE = {
  tooltip: { trigger: 'item' },
  legend: { type: 'scroll', bottom: 0 },
} as const;

export const usePieChart = ({
  sales,
  start,
  end,
  products,
  candidates,
  getVal,
}: ChartProps) => {
  // 정렬 + 타임스탬프 배열
  const prepared = useMemo(() => {
    if (sales.length === 0) {
      return {
        rows: [] as Array<Sales & { __ts: number }>,
        ts: [] as number[],
      };
    }
    const rows: Array<Sales & { __ts: number }> = sales.map((s) => ({
      ...s,
      __ts: new Date(s.salesDate).getTime(),
    }));
    rows.sort((a, b) => a.__ts - b.__ts);
    const ts = rows.map((r) => r.__ts);
    return { rows, ts };
  }, [sales]);

  // 경계 ms
  const { startTs, endTs } = useMemo(() => {
    const s = start ? new Date(start).getTime() : Number.NEGATIVE_INFINITY;
    const e = end ? new Date(end).getTime() : Number.POSITIVE_INFINITY;
    return { startTs: s, endTs: e };
  }, [start, end]);

  // 구간 추출
  const [lo, hi] = useMemo<[number, number]>(() => {
    if (prepared.ts.length === 0) return [0, 0];
    const l = lowerBound(prepared.ts, startTs);
    const r = upperBound(prepared.ts, endTs);
    return [l, r];
  }, [prepared.ts, startTs, endTs]);

  // productId -> genre 매핑
  const productGenre = useMemo(() => {
    const map = new Map<number, string>();
    for (const p of products)
      map.set(p.productId, p.genre ?? CHART_TEXT.FALLBACK.GENRE);
    return map;
  }, [products]);

  const { labelsSales, valuesSales, labelsCount, valuesCount } = useMemo(() => {
    if (hi <= lo) {
      return {
        labelsSales: [] as string[],
        valuesSales: [] as number[],
        labelsCount: [] as string[],
        valuesCount: [] as number[],
      };
    }

    const filtered = prepared.rows.slice(lo, hi);
    const useFilter = !!candidates;

    const salesByGenre = new Map<string, number>();
    const countByGenre = new Map<string, number>();

    for (let i = 0; i < filtered.length; i++) {
      const row = filtered[i];
      if (useFilter && !candidates!.has(row.productId)) continue;

      const genre =
        productGenre.get(row.productId) ?? CHART_TEXT.FALLBACK.GENRE;
      salesByGenre.set(genre, (salesByGenre.get(genre) ?? 0) + getVal(row));
      countByGenre.set(genre, (countByGenre.get(genre) ?? 0) + 1);
    }

    // label 정렬
    const labelsSales = Array.from(salesByGenre.keys()).sort();
    const valuesSales = labelsSales.map((g) => salesByGenre.get(g) ?? 0);

    const labelsCount = Array.from(countByGenre.keys()).sort();
    const valuesCount = labelsCount.map((g) => countByGenre.get(g) ?? 0);

    return { labelsSales, valuesSales, labelsCount, valuesCount };
  }, [prepared.rows, lo, hi, candidates, productGenre, getVal]);

  // 옵션 생성
  const pieOption = useMemo<{
    sales?: EChartsOption;
    count?: EChartsOption;
  }>(() => {
    const salesOpt =
      labelsSales.length > 0
        ? {
            ...PIE_BASE,
            ...makeGenrePieOption({ labels: labelsSales, values: valuesSales }),
          }
        : undefined;

    const countOpt =
      labelsCount.length > 0
        ? {
            ...PIE_BASE,
            ...makeGenrePieOption({ labels: labelsCount, values: valuesCount }),
          }
        : undefined;

    return { sales: salesOpt, count: countOpt };
  }, [labelsSales, valuesSales, labelsCount, valuesCount]);

  return { pieOption };
};
