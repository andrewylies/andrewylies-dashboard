import { memo, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

export interface LineChartProps {
  data: number[];
}

export const ChartLine = memo(({ data }: LineChartProps) => {
  const option: EChartsOption = useMemo(
    () => ({
      xAxis: {
        type: 'category',
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          data,
          type: 'line',
          smooth: true,
        },
      ],
    }),
    [data]
  );

  return <ReactECharts option={option} style={{ height: 400 }} />;
});
