import { Paper, useTheme } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

type Props = {
  option?: EChartsOption;
};

export const ChartSection = ({ option }: Props) => {
  const muiTheme = useTheme();
  const mode = muiTheme.palette.mode;
  return (
    <Paper elevation={1}>
      <ReactECharts option={option} notMerge lazyUpdate theme={mode} />
    </Paper>
  );
};
