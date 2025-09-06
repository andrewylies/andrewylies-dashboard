import { Paper, useTheme } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import type { ECElementEvent, EChartsOption } from 'echarts';
import { useNavigate } from '@tanstack/react-router';
import type { DashboardSearch } from '@/types';
import { useCallback, useMemo } from 'react';
import { formatDateYMD } from '@/lib';

type Props = {
  option?: EChartsOption;
  type: 'line' | 'bar';
};

export const ChartSection = ({ option, type }: Props) => {
  const muiTheme = useTheme();
  const mode = muiTheme.palette.mode;

  const navigate = useNavigate();

  const handleClick = useCallback(
    (params: ECElementEvent) => {
      if (type === 'bar') {
        const nextCategory = String(params.seriesName ?? '').trim();
        if (!nextCategory) return;

        void navigate({
          from: '/',
          search: (prev: DashboardSearch): DashboardSearch => ({
            ...prev,
            category: nextCategory,
          }),
        });
        return;
      }

      if (type === 'line') {
        const clicked = typeof params.name === 'string' ? params.name : '';
        if (!/^\d{4}-\d{2}-\d{2}$/.test(clicked)) return;

        const today = formatDateYMD();

        const start = clicked <= today ? clicked : today;
        const end = clicked <= today ? today : clicked;

        void navigate({
          from: '/',
          search: (prev: DashboardSearch): DashboardSearch => ({
            ...prev,
            start,
            end,
          }),
        });
      }
    },
    [navigate, type]
  );

  const onEvents = useMemo(() => ({ click: handleClick }), [handleClick]);

  return (
    <Paper elevation={1} sx={{ height: 400 }}>
      <ReactECharts
        option={option}
        notMerge
        lazyUpdate
        theme={mode}
        style={{ height: '100%' }}
        onEvents={onEvents}
      />
    </Paper>
  );
};
