import { type BarSeriesOption, type EChartsOption } from 'echarts';
import { formatKRWShort } from '@/lib/format';
import { CHART_TEXT } from '@/constants/common.ts';

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
      bottom: 0,
      orient: 'horizontal',
      padding: 20,
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
