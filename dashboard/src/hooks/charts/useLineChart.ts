import { useMemo } from 'react';
import type { EChartsOption } from 'echarts';
import type { Sales } from '@/types/api/sales';
import { sortSalesByDate, sliceByDate } from '@/lib/time';
import { niceCeil } from '@/lib/format';
import { makeSalesLineOption } from '@/constants/charts/line';
import type { ChartCommon } from './common';

export type UseLineChartResult = {
  lineOption?: EChartsOption;
  dateList: string[];
  valueList: number[];
  baselineValueList?: number[];
  yMax: number;
};

export const useLineChart = ({
  sales,
  start,
  end,
  candidates,
  getVal,
}: Pick<
  ChartCommon,
  'sales' | 'start' | 'end' | 'candidates' | 'getVal'
>): UseLineChartResult => {
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
  }, [sales, start, end, candidates, getVal]);

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
