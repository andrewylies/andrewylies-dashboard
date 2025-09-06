import { useDeferredValue } from 'react';
import { Grid } from '@mui/material';
import { useSearch } from '@tanstack/react-router';
import type { DashboardSearch } from '@/types';

import { OverlayLoading } from '@/components/common/OverlayLoading.tsx';

import { FilterSearchBar } from '@/components/filter/FilterSearchBar.tsx';
import { ChartSection } from '@/components/charts/Section/ChartSection.tsx';
import { useChartData } from '@/hooks/useChartData.ts';

export const Dashboard = () => {
  const search: DashboardSearch = useSearch({ from: '/' });
  const deferredSearch = useDeferredValue(search);

  const { lineOption, stackOption, isPending } = useChartData(deferredSearch);

  if (isPending) return <OverlayLoading />;

  return (
    <Grid container spacing={1} sx={{ pt: 3, pb: 5 }}>
      {/* 검색/필터 바 */}
      <Grid size={{ xs: 12 }}>
        <FilterSearchBar />
      </Grid>

      {/* 라인 차트 */}
      <Grid size={{ xs: 12 }}>
        <ChartSection option={lineOption} type={'line'} />
      </Grid>

      {/* 스택 차트 */}
      <Grid size={{ xs: 12 }}>
        <ChartSection option={stackOption} type={'bar'} />
      </Grid>
    </Grid>
  );
};
