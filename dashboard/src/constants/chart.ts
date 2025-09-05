import type { EChartsOption, LineSeriesOption } from 'echarts';
import { formatKRWShort } from '@/lib/format';
import { CHART_TEXT } from '@/constants/common.ts';

export type LineChartParams = {
  dateList: string[];
  valueList: number[];
  yMax: number;
  baselineValueList?: number[];
};

export const makeSalesLineOption = ({
  dateList,
  valueList,
  yMax,
  baselineValueList,
}: LineChartParams): EChartsOption => {
  const series: LineSeriesOption[] = [];

  if (baselineValueList) {
    series.push({
      name: CHART_TEXT.LEGEND.ALL,
      type: 'line',
      showSymbol: false,
      smooth: true,
      data: baselineValueList,
      lineStyle: { width: 1, type: 'dashed' },
      z: 1,
    });
  }

  series.push({
    name: baselineValueList
      ? CHART_TEXT.LEGEND.FILTERED
      : CHART_TEXT.LEGEND.ALL,
    type: 'line',
    showSymbol: false,
    smooth: true,
    data: valueList,
    z: 2,
  });

  const option: EChartsOption = {
    title: {
      text: CHART_TEXT.TITLE.LINE,
      left: 'center',
    },
    darkMode: 'auto',
    animation: true,

    legend: {
      bottom: 0,
      orient: 'horizontal',
    },
    tooltip: { trigger: 'axis' },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },

    xAxis: [
      {
        type: 'category' as const,
        boundaryGap: false,
        axisTick: { show: false },
        data: dateList,
        axisLabel: {
          // YYYY-MM-DD -> MM/DD
          formatter: ((val) => {
            if (val.length >= 10) {
              const mm = val.slice(5, 7);
              const dd = val.slice(8, 10);
              return `${mm}/${dd}`;
            }
            return String(val);
          }) as (value: string, index: number) => string,
        },
      },
    ],

    yAxis: [
      {
        type: 'value',
        min: 0,
        max: yMax,
        axisLine: { show: false },
        splitLine: { show: true },
        axisLabel: {
          formatter: ((val: number) =>
            formatKRWShort(Number(val ?? 0), false)) as (
            value: number,
            index: number
          ) => string,
        },
      },
    ],

    series,
    progressive: 1000,
    progressiveThreshold: 2000,
  };

  return option;
};
