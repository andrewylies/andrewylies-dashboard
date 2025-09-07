import { Paper, useTheme, Box, Skeleton } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import type { ECElementEvent, EChartsOption } from 'echarts';
import { useNavigate } from '@tanstack/react-router';
import type { DashboardSearch } from '@/types';
import { memo, useCallback, useMemo } from 'react';
import { formatDateYMD } from '@/lib';
import { CHART_SECTION_DEFAULT_HEIGHT } from '@/constants/layout.tsx';

type Props = {
  option?: EChartsOption;
  type: 'line' | 'bar' | 'pie';
  toolbar?: React.ReactNode;
  toolbarKey?: string;
  height?: number;
  isPending?: boolean;
  hidden?: boolean;
};

const ECHARTS_STYLE = { height: '100%' } as const;

const areEqual = (prev: Props, next: Props) =>
  prev.type === next.type &&
  prev.option === next.option &&
  prev.height === next.height &&
  prev.isPending === next.isPending &&
  prev.hidden === next.hidden &&
  (prev.toolbarKey ?? null) === (next.toolbarKey ?? null);

export const ChartSection = memo(
  ({
    option,
    type,
    toolbar,
    toolbarKey,
    height = CHART_SECTION_DEFAULT_HEIGHT,
    isPending = false,
    hidden = false,
  }: Props) => {
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
          return;
        }

        if (type === 'pie') {
          const nextGenre =
            typeof params.name === 'string' ? params.name.trim() : '';
          if (!nextGenre) return;
          void navigate({
            from: '/',
            search: (prev: DashboardSearch): DashboardSearch => ({
              ...prev,
              genre: nextGenre,
            }),
          });
        }
      },
      [navigate, type]
    );

    const onEvents = useMemo(() => ({ click: handleClick }), [handleClick]);

    if (hidden) return null;

    if (isPending) {
      return (
        <Paper
          elevation={1}
          sx={{
            height,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 5,
            py: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            {/* 차트 스켈레톤 */}
            <Skeleton
              width={170}
              variant="text"
              animation={'wave'}
              sx={{ fontSize: '1rem' }}
            />
            <Skeleton
              width={200}
              variant="text"
              animation={'wave'}
              sx={{ fontSize: '1rem' }}
            />
          </Box>
          <Skeleton
            variant="rounded"
            width={'100%'}
            height={300}
            animation={'pulse'}
          />
        </Paper>
      );
    }

    if (!option) return null;

    return (
      <Paper elevation={1} sx={{ height, position: 'relative' }}>
        {/* 우측 상단 툴바 */}
        {toolbar && (
          <Box
            sx={{
              px: 2,
              py: 2,
              position: 'absolute',
              left: 0,
              top: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              zIndex: 1,
            }}
          >
            <Box
              key={toolbarKey}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              {toolbar}
            </Box>
          </Box>
        )}

        {/* 차트 */}
        <Box sx={{ height: '100%' }}>
          <ReactECharts
            option={option}
            notMerge
            lazyUpdate
            theme={mode === 'dark' ? 'dark' : 'light'}
            style={ECHARTS_STYLE}
            onEvents={onEvents}
          />
        </Box>
      </Paper>
    );
  },
  areEqual
);

ChartSection.displayName = 'ChartSection';
