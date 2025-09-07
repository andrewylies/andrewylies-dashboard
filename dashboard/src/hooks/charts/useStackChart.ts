import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import type { Sales } from '@/types/api/sales';
import { sortSalesByDate, sliceByDate } from '@/lib/time';
import { niceCeil } from '@/lib/format';
import { makeSalesStackOption } from '@/constants/charts/stack';
import type { ChartCommon } from './common';
import { STACK_Y_AXIS_MAX_LENGTH } from '@/constants';

export type UseStackChartResult = {
  stackOption?: EChartsOption;
  stackCategories: string[];
  stackStacks: string[];
  stackMatrix: number[][];
  stackXMax: number;
};

/**
 * 스택 차트 옵션을 생성하는 훅
 */
export const useStackChart = ({
  sales,
  products,
  start,
  end,
  candidates,
  getVal,
}: Pick<
  ChartCommon,
  'sales' | 'products' | 'start' | 'end' | 'candidates' | 'getVal'
>): UseStackChartResult => {
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

      const totals: Array<{ pub: string; total: number }> = [];
      for (const [pub, catMap] of agg) {
        let sum = 0;
        for (const v of catMap.values()) sum += v;
        totals.push({ pub, total: sum });
      }
      totals.sort((a, b) => a.total - b.total);

      const top = totals.slice(0, STACK_Y_AXIS_MAX_LENGTH);
      const stackCategories = top.map((t) => t.pub);

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
        stackXMax: niceCeil(maxX),
      };
    }, [sales, products, candidates, getVal, start, end]);

  const stackOption: EChartsOption | undefined = useMemo(() => {
    if (stackCategories.length === 0) return undefined;
    return makeSalesStackOption({
      categories: stackCategories,
      stacks: stackStacks,
      matrix: stackMatrix,
      xMax: stackXMax,
    });
  }, [stackCategories, stackStacks, stackMatrix, stackXMax]);

  return { stackOption, stackCategories, stackStacks, stackMatrix, stackXMax };
};
