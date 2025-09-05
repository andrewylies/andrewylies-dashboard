import { Card, CardContent } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

type Props = {
  option?: EChartsOption;
};

export const ChartSection = ({ option }: Props) => {
  return (
    <Card>
      <CardContent>
        <ReactECharts option={option} notMerge lazyUpdate />
      </CardContent>
    </Card>
  );
};
