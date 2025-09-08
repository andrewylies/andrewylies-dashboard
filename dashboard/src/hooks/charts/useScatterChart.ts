import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import type { Sales } from '@/types/api/sales';
import type { Product } from '@/types/api/products';
import { makeSalesScatterOption } from '@/constants/charts';
import { lowerBound, upperBound } from '@/lib';
import dayjs from 'dayjs';

type Props = {
  sales: ReadonlyArray<Sales>;
  products: ReadonlyArray<Product>;
  start: string;
  end: string;
  candidates?: ReadonlySet<number>;
  /** 합산 기준 지표 (예: totalSales / webSales / appSales 등) */
  getVal: (s: Sales) => number;
};

export function useScatterChart({
  sales,
  products,
  start,
  end,
  candidates,
  getVal,
}: Props): { scatterOption?: EChartsOption } {
  // (1) 정렬 + 타임스탬프 인덱스
  const prepared = useMemo(() => {
    if (sales.length === 0) {
      return {
        rows: [] as Array<Sales & { __ts: number }>,
        ts: [] as number[],
      };
    }
    const rows: Array<Sales & { __ts: number }> = sales.map((s) => ({
      ...s,
      __ts: dayjs(s.salesDate).valueOf(),
    }));
    rows.sort((a, b) => a.__ts - b.__ts);
    const ts = rows.map((r) => r.__ts);
    return { rows, ts };
  }, [sales]);

  // (2) 구간 경계
  const [lo, hi] = useMemo<[number, number]>(() => {
    if (prepared.ts.length === 0) return [0, 0];
    const startTs = start ? dayjs(start).valueOf() : Number.NEGATIVE_INFINITY;
    const endTs = end ? dayjs(end).valueOf() : Number.POSITIVE_INFINITY;
    return [lowerBound(prepared.ts, startTs), upperBound(prepared.ts, endTs)];
  }, [prepared.ts, start, end]);

  // (3) 제품 메타
  const meta = useMemo(() => {
    const m = new Map<
      number,
      { title: string; publisher: string; category: string; genre: string }
    >();
    for (const p of products) {
      m.set(p.productId, {
        title: p.title,
        publisher: p.publisher ?? '',
        category: p.category ?? '',
        genre: p.genre ?? '',
      });
    }
    return m;
  }, [products]);

  // (4) 단일 패스 집계 → 산점도 포인트
  const { points, maxSales } = useMemo(() => {
    if (hi <= lo) return { points: [], maxSales: 0 };

    const allow = candidates;
    const agg = new Map<
      number,
      { read: number; paid: number; sales: number }
    >();

    let max = 0;

    for (let i = lo; i < hi; i++) {
      const r = prepared.rows[i];
      if (allow && !allow.has(r.productId)) continue;

      const cur = agg.get(r.productId) ?? { read: 0, paid: 0, sales: 0 };
      cur.read += r.totalReadUser;
      cur.paid += r.totalPaidUser;
      cur.sales += getVal(r);
      agg.set(r.productId, cur);

      if (cur.sales > max) max = cur.sales;
    }

    const out = [];
    for (const [pid, v] of agg.entries()) {
      const m = meta.get(pid);
      if (!m) continue;
      out.push({
        name: m.title,
        productId: pid,
        publisher: m.publisher,
        category: m.category,
        genre: m.genre,
        value: [v.read, v.paid, v.sales],
      });
    }
    return { points: out, maxSales: max };
  }, [prepared.rows, lo, hi, candidates, meta, getVal]);

  // (5) 옵션 생성 (상수화된 헬퍼 사용)
  const scatterOption = useMemo<EChartsOption | undefined>(() => {
    if (points.length === 0) return undefined;
    return makeSalesScatterOption({ data: points, maxSales });
  }, [points, maxSales]);

  return { scatterOption };
}
