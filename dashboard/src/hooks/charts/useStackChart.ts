import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import type { Sales } from '@/types/api/sales';
import type { Product } from '@/types/api/products';
import { sortSalesByDate, sliceByDate } from '@/lib/time';
import { niceCeil } from '@/lib/format';
import { makeSalesStackOption } from '@/constants/charts/stack';
import { STACK_Y_AXIS_MAX_LENGTH } from '@/constants';

export type UseStackChartResult = {
  stackOption?: EChartsOption;
  stackCategories: string[];
  stackStacks: string[];
  stackMatrix: number[][];
  stackXMax: number;
};

/**
 * 스택 차트 옵션을 생성하는 훅 (명시적 props, 기존 알고리즘 유지)
 */
export const useStackChart = ({
  sales,
  products,
  start,
  end,
  candidates,
  getVal,
}: {
  sales: Sales[];
  products: Product[];
  start: string;
  end: string;
  candidates?: Set<number>;
  getVal: (s: Sales) => number;
}): UseStackChartResult => {
  const { stackCategories, stackStacks, stackMatrix, stackXMax } =
    useMemo(() => {
      if (sales.length === 0 || products.length === 0) {
        return {
          stackCategories: [],
          stackStacks: [],
          stackMatrix: [],
          stackXMax: 1,
        };
      }

      // 제품 메타 매핑
      const meta = new Map<number, { publisher: string; category: string }>();
      for (const p of products) {
        meta.set(p.productId, {
          publisher: p.publisher ?? '기타',
          category: p.category ?? '기타',
        });
      }

      // 날짜 정렬 및 구간 슬라이스 (기존 유틸 유지)
      const { sorted, dates } = sortSalesByDate<Sales>(sales);
      const sliced = sliceByDate<Sales>(sorted, dates, start, end);

      // 집계: publisher → (category → value)
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

      // 스택(열) = 카테고리(여기선 작품 카테고리)
      const stackStacks = Array.from(cats.values()).sort();

      // 퍼블리셔별 합산 후 상위 N개 선택 (기존 정렬 방향 유지)
      const totals: Array<{ pub: string; total: number }> = [];
      for (const [pub, catMap] of agg) {
        let sum = 0;
        for (const v of catMap.values()) sum += v;
        totals.push({ pub, total: sum });
      }
      totals.sort((a, b) => a.total - b.total);

      const top = totals.slice(0, STACK_Y_AXIS_MAX_LENGTH);
      const stackCategories = top.map((t) => t.pub);

      // 매트릭스 [stack(si)][category(ci)]
      const stackMatrix: number[][] = stackStacks.map(() =>
        new Array(stackCategories.length).fill(0)
      );

      let maxX = 0;
      for (let ci = 0; ci < stackCategories.length; ci++) {
        const pub = stackCategories[ci];
        const catMap = agg.get(pub)!;
        let rowSum = 0;

        for (let si = 0; si < stackStacks.length; si++) {
          const cat = stackStacks[si];
          const v = catMap.get(cat) ?? 0;
          stackMatrix[si][ci] = v;
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
