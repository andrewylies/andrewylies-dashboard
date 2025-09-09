import type { EChartsOption, LineSeriesOption } from 'echarts';
import { CHART_TEXT } from '@/constants';
import { formatKRWShort } from '@/lib';

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
          formatter: (val) => {
            if (val.length >= 10) {
              const mm = val.slice(5, 7);
              const dd = val.slice(8, 10);
              return `${mm}/${dd}`;
            }
            return String(val);
          },
        },
      },
    ],

    yAxis: [
      {
        name: CHART_TEXT.LINE.AXIS.Y,
        type: 'value',
        min: 0,
        max: yMax,
        axisLine: { show: false },
        splitLine: { show: true },
        axisLabel: {
          formatter: (val: number) => formatKRWShort(Number(val ?? 0), false),
        },
      },
    ],
    series,
    progressive: 6000,
    progressiveThreshold: 4000,
  };
};
