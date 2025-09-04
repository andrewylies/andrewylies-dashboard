import { useMemo, useDeferredValue } from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import ReactECharts from 'echarts-for-react';

import { useSearch } from '@tanstack/react-router';
import type { DashboardSearch } from '@/types';

import { OverlayLoading } from '@/components/common/OverlayLoading.tsx';
import { useChartFilter } from '@/hooks/useChartFilter.ts';
import {
  buildLineOptionGradient,
  buildPieSpecialLabelOption,
  buildStackedHorizontalOption,
} from '@/lib/chart/options';
import { FilterSearchBar } from '@/components/filter/FilterSearchBar.tsx';

export const Dashboard = () => {
  const search = useSearch({ from: '/' }) as DashboardSearch;

  const deferredSearch = useDeferredValue(search);

  const {
    isLoading,
    error,
    lineSeries,
    stackedByPublisherSeries,
    pieByGenreSeries,
  } = useChartFilter(deferredSearch);

  const lineOption = useMemo(
    () => buildLineOptionGradient(lineSeries.x, lineSeries.y),
    [lineSeries]
  );

  const stackedOption = useMemo(
    () =>
      buildStackedHorizontalOption(stackedByPublisherSeries.labels, [
        { name: '매출', data: stackedByPublisherSeries.data },
      ]),
    [stackedByPublisherSeries]
  );

  const pieOption = useMemo(
    () => buildPieSpecialLabelOption(pieByGenreSeries),
    [pieByGenreSeries]
  );

  if (isLoading) return <OverlayLoading />;
  if (error) return <div>데이터 로딩 실패</div>;

  return (
    <Grid container spacing={2}>
      {/* 검색/필터 바 */}
      <Grid size={{ xs: 12 }}>
        <FilterSearchBar />
      </Grid>

      {/* 라인 차트 */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              기간별 전체 매출 추이
            </Typography>
            <ReactECharts option={lineOption} style={{ height: 360 }} />
          </CardContent>
        </Card>
      </Grid>

      {/* 스택 바 차트 */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              출판사별 매출 (Stacked)
            </Typography>
            <ReactECharts option={stackedOption} style={{ height: 360 }} />
          </CardContent>
        </Card>
      </Grid>

      {/* 파이 차트 */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              장르별 매출 비율
            </Typography>
            <ReactECharts option={pieOption} style={{ height: 360 }} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
