import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import type { Sales } from '@/types/api/sales';
import type { Product } from '@/types/api/products';
import { sortSalesByDate, sliceByDate } from '@/lib/time';
import { makeGenrePieOption } from '@/constants/charts/pie';
import type { ChartCommon } from './common';

export type PieOptions = {
  /** 장르별 매출 비율 */
  sales?: EChartsOption;
  /** 장르별 작품 수 비율 */
  count?: EChartsOption;
};

export const usePieChart = ({
  sales,
  products,
  start,
  end,
  candidates,
  getVal,
}: Pick<
  ChartCommon,
  'sales' | 'products' | 'start' | 'end' | 'candidates' | 'getVal'
>): { pieOption: PieOptions } => {
  const {
    pieGenreLabelsSales,
    pieGenreValuesSales,
    pieGenreLabelsCount,
    pieGenreValuesCount,
  } = useMemo(() => {
    if (!products.length) {
      return {
        pieGenreLabelsSales: [] as string[],
        pieGenreValuesSales: [] as number[],
        pieGenreLabelsCount: [] as string[],
        pieGenreValuesCount: [] as number[],
      };
    }

    const productIdToGenre = new Map<number, string>();
    for (const p of products as Product[]) {
      productIdToGenre.set(p.productId, p.genre || '기타');
    }

    const genreCount = new Map<string, number>();
    {
      const pool =
        candidates ??
        new Set<number>((products as Product[]).map((p) => p.productId));
      for (const id of pool) {
        const g = productIdToGenre.get(id) ?? '기타';
        genreCount.set(g, (genreCount.get(g) ?? 0) + 1);
      }
    }

    const genreSales = new Map<string, number>();
    if (sales.length) {
      const { sorted, dates } = sortSalesByDate<Sales>(sales);
      const sliced = sliceByDate<Sales>(sorted, dates, start, end);
      const useFilter = !!candidates;

      for (let i = 0; i < sliced.length; i++) {
        const row = sliced[i];
        if (useFilter && !candidates!.has(row.productId)) continue;
        const g = productIdToGenre.get(row.productId) ?? '기타';
        genreSales.set(g, (genreSales.get(g) ?? 0) + getVal(row));
      }
    }

    const toVectors = (m: Map<string, number>) => {
      const arr = Array.from(m.entries());
      arr.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
      return { labels: arr.map(([k]) => k), values: arr.map(([, v]) => v) };
    };

    const salesVec = toVectors(genreSales);
    const countVec = toVectors(genreCount);

    return {
      pieGenreLabelsSales: salesVec.labels,
      pieGenreValuesSales: salesVec.values,
      pieGenreLabelsCount: countVec.labels,
      pieGenreValuesCount: countVec.values,
    };
  }, [products, sales, candidates, getVal, start, end]);

  const pieOption: PieOptions = useMemo(() => {
    const salesOpt =
      pieGenreLabelsSales.length > 0
        ? makeGenrePieOption({
            labels: pieGenreLabelsSales,
            values: pieGenreValuesSales,
            subtitle: 'Sales Share',
          })
        : undefined;

    const countOpt =
      pieGenreLabelsCount.length > 0
        ? makeGenrePieOption({
            labels: pieGenreLabelsCount,
            values: pieGenreValuesCount,
            subtitle: 'Titles Share',
          })
        : undefined;

    return { sales: salesOpt, count: countOpt };
  }, [
    pieGenreLabelsSales,
    pieGenreValuesSales,
    pieGenreLabelsCount,
    pieGenreValuesCount,
  ]);

  return { pieOption };
};
