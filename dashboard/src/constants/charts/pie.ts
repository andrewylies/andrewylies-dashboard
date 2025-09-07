import type { EChartsOption, PieSeriesOption } from 'echarts';
import { CHART_TEXT } from '@/constants';

export type GenrePieParams = {
  labels: string[];
  values: number[];
  subtitle?: string;
};

export const makeGenrePieOption = ({
  labels,
  values,
}: GenrePieParams): EChartsOption => {
  const data = labels.map((name, i) => ({
    name,
    value: values[i] ?? 0,
  }));

  const series: PieSeriesOption[] = [
    {
      name: 'Genre Share',
      type: 'pie',
      radius: '50%',
      data,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
      label: {
        show: true,
        formatter: '{b}\n{d}%',
      },
    },
  ];

  return {
    darkMode: 'auto',
    animation: true,
    title: {
      text: CHART_TEXT.PIE.TEXT.TITLE,
      subtext: CHART_TEXT.PIE.TEXT.SUB_TITLE,
      left: 'center',
      top: 15,
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
      top: 15,
      right: 15,
    },
    tooltip: {
      trigger: 'item',
    },
    legend: {
      bottom: 0,
      orient: 'horizontal',
      padding: 20,
    },
    series,
    progressive: 1000,
    progressiveThreshold: 2000,
  };
};
