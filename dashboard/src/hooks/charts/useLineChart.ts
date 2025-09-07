import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import type { Sales } from '@/types/api/sales';
import { niceCeil } from '@/lib/format';
import { makeSalesLineOption } from '@/constants/charts/line';
import { lowerBound, upperBound } from '@/lib';

export type UseLineChartResult = {
  lineOption?: EChartsOption;
  dateList: string[];
  valueList: number[];
  baselineValueList?: number[];
  yMax: number;
};

/**
 * 라인 차트 옵션을 생성하는 훅 (이진탐색 기반 범위 슬라이스)
 */
export const useLineChart = ({
  sales,
  start,
  end,
  candidates,
  getVal,
}: {
  sales: Sales[];
  start: string;
  end: string;
  candidates?: Set<number>;
  getVal: (s: Sales) => number;
}): UseLineChartResult => {
  // 1) 정렬 + 타임스탬프 준비 (한 번만)
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

  // 2) 문자열 경계를 숫자(ms)로
  const { startTs, endTs } = useMemo(() => {
    const s = start ? new Date(start).getTime() : Number.NEGATIVE_INFINITY;
    const e = end ? new Date(end).getTime() : Number.POSITIVE_INFINITY;
    return { startTs: s, endTs: e };
  }, [start, end]);

  // 3) 이진탐색으로 슬라이스 인덱스 결정
  const [lo, hi] = useMemo<[number, number]>(() => {
    if (prepared.ts.length === 0) return [0, 0];
    const l = lowerBound(prepared.ts, startTs);
    const r = upperBound(prepared.ts, endTs);
    return [l, r];
  }, [prepared.ts, startTs, endTs]);

  // 4) 합산/최대값 계산
  const { dateList, valueList, baselineValueList, yMax } = useMemo(() => {
    if (hi <= lo) {
      return {
        dateList: [],
        valueList: [],
        baselineValueList: undefined,
        yMax: 1,
      };
    }

    const ranged = prepared.rows.slice(lo, hi);

    const baseMap = new Map<string, number>();
    const filtMap = new Map<string, number>();
    let maxY = 0;
    const useFilter = !!candidates;

    for (let i = 0; i < ranged.length; i++) {
      const row = ranged[i];
      const key = row.salesDate;
      const val = getVal(row);

      const acc = (baseMap.get(key) ?? 0) + val;
      baseMap.set(key, acc);
      if (acc > maxY) maxY = acc;

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
  }, [prepared.rows, lo, hi, candidates, getVal]);

  // 5) 차트 옵션
  const lineOption: EChartsOption | undefined = useMemo(() => {
    if (dateList.length === 0) return undefined;
    return makeSalesLineOption({
      dateList,
      valueList,
      baselineValueList,
      yMax,
    });
  }, [dateList, valueList, baselineValueList, yMax]);

  return { lineOption, dateList, valueList, yMax, baselineValueList };
};
