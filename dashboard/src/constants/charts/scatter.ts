import type { EChartsOption, ScatterSeriesOption } from 'echarts';
type ScatterDataItem = NonNullable<ScatterSeriesOption['data']>[number];

import { CHART_TEXT } from '@/constants';
import { formatKRWShort } from '@/lib';

export function makeSalesScatterOption({
  data,
  maxSales,
}: {
  data: ScatterDataItem[];
  maxSales: number;
}): EChartsOption {
  const size = (val: number) => {
    if (val <= 0) return 1;
    const s = 1 + 7 * Math.sqrt(val / Math.max(1, maxSales));
    return Math.max(1, Math.min(8, Math.floor(s))); // 1~8px
  };

  return {
    title: {
      text: CHART_TEXT.SCATTER.TEXT.TITLE,
      left: 'center',
      subtext: CHART_TEXT.SCATTER.TEXT.SUB_TITLE,
      top: 15,
    },
    tooltip: { trigger: 'item' },
    grid: {
      top: 100,
      bottom: 95,
      left: 80,
      right: 80,
    },
    xAxis: {
      name: CHART_TEXT.SCATTER.AXIS.X,
      type: 'value',
      axisLabel: {
        formatter: (v: number) => formatKRWShort(v),
      },
    },
    yAxis: {
      name: CHART_TEXT.SCATTER.AXIS.Y,
      type: 'value',
      axisLabel: { formatter: (v: number) => formatKRWShort(v) },
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
      top: 15,
      right: 15,
    },
    visualMap: {
      type: 'continuous',
      dimension: 2,
      min: 0,
      text: [CHART_TEXT.SCATTER.VISUAL.HIGH, CHART_TEXT.SCATTER.VISUAL.LOW],
      max: Math.max(1, maxSales),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      padding: 20,
      inRange: { color: ['#f2c31a', '#24b7f2'] },
    },
    series: [
      {
        type: 'scatter',
        name: CHART_TEXT.SCATTER.SERIES,
        data,
        symbolSize: (val: unknown) => {
          const arr = Array.isArray(val) ? (val as number[]) : [];
          const sales = arr[2] ?? 0;
          return size(sales);
        },
        itemStyle: {
          opacity: 0.5,
        },
        progressive: 5000,
        progressiveThreshold: 4000,
        animation: true,
        emphasis: { focus: 'series' },
      },
    ],
  };
}
