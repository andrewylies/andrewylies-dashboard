import {
  type BarSeriesOption,
  type EChartsOption,
  type LineSeriesOption,
} from 'echarts';
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
      name: CHART_TEXT.LINE.LEGEND.ALL,
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
      ? CHART_TEXT.LINE.LEGEND.FILTERED
      : CHART_TEXT.LINE.LEGEND.ALL,
    type: 'line',
    showSymbol: false,
    smooth: true,
    data: valueList,
    z: 2,
  });

  return {
    title: {
      text: CHART_TEXT.LINE.TEXT.TITLE,
      left: 'center',
      subtext: CHART_TEXT.LINE.TEXT.SUB_TITLE,
      top: 15,
    },
    grid: {
      top: 100,
      bottom: 80,
      left: 60,
    },
    animation: true,
    legend: {
      bottom: 15,
      orient: 'horizontal',
    },
    tooltip: { trigger: 'axis' },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
      top: 15,
      right: 15,
    },

    xAxis: [
      {
        type: 'category',
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
        name: '(₩)',
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
};

export type StackedBarParams = {
  /** y축 라벨: 출판사 목록 (정렬 완료) */
  categories: string[];
  /** 스택 라벨: 카테고리 목록 */
  stacks: string[];
  /** [stackIndex][categoryIndex] 매트릭스 */
  matrix: number[][];
  /** x축 최대값 */
  xMax: number;
};

export const makeSalesStackOption = ({
  categories,
  stacks,
  matrix,
  xMax,
}: StackedBarParams): EChartsOption => {
  const series: BarSeriesOption[] = stacks.map((name, sIdx) => ({
    name,
    type: 'bar',
    stack: 'total',
    emphasis: { focus: 'series' },
    label: {
      show: true,
      formatter: ({ value }) => formatKRWShort(Number(value || 0), false),
    },
    data: matrix[sIdx] ?? [],
  }));

  return {
    title: {
      text: CHART_TEXT.STACKED_BAR.TEXT.TITLE,
      left: 'center',
      subtext: CHART_TEXT.STACKED_BAR.TEXT.SUB_TITLE,
      top: 15,
    },
    darkMode: 'auto',
    animation: true,
    legend: {
      bottom: 15,
      orient: 'horizontal',
    },
    grid: {
      top: 100,
      bottom: 80,
      left: 80,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
      top: 15,
      right: 15,
    },
    xAxis: {
      name: '(₩)',
      type: 'value',
      min: 0,
      max: xMax,
      axisLabel: {
        formatter: (val: number) => formatKRWShort(Number(val ?? 0), false),
      },
      splitLine: { show: true },
    },
    yAxis: {
      type: 'category',
      data: categories,
      axisTick: { show: false },
    },
    series,
    progressive: 1000,
    progressiveThreshold: 2000,
  };
};
