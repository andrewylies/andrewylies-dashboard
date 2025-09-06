import { useDeferredValue } from 'react';
import { Grid } from '@mui/material';
import { useSearch } from '@tanstack/react-router';
import type { DashboardSearch } from '@/types';

import { OverlayLoading } from '@/components/common/OverlayLoading.tsx';

import { FilterSearchBar } from '@/components/filter/FilterSearchBar.tsx';
import { ChartSection } from '@/components/charts/Section/ChartSection.tsx';
import { useChartData } from '@/hooks/useChartData.ts';
import { FilterNoResult } from '@/components/filter/FilterNoResult.tsx';

export const Dashboard = () => {
  const search: DashboardSearch = useSearch({ from: '/' });
  const deferredSearch = useDeferredValue(search);

  const { lineOption, stackOption, isPending } = useChartData(deferredSearch);

  const SHOW_STYLE = { display: 'block' } as const;
  const HIDE_STYLE = { display: 'none' } as const;

  const hasData = !!(lineOption && stackOption);
  const dataStyle = hasData ? SHOW_STYLE : HIDE_STYLE;
  const emptyStyle = hasData ? HIDE_STYLE : SHOW_STYLE;

  if (isPending) return <OverlayLoading />;

  return (
    <Grid container spacing={1} sx={{ pt: 3, pb: 5 }}>
      {/* 검색/필터 바 */}
      <Grid size={{ xs: 12 }}>
        <FilterSearchBar />
      </Grid>

      {/* 결과없음 */}
      <Grid size={{ xs: 12 }} sx={emptyStyle} aria-hidden={hasData}>
        <FilterNoResult />
      </Grid>

      {/* 차트  */}
      <Grid size={{ xs: 12 }} sx={dataStyle} aria-hidden={!hasData}>
        <ChartSection option={lineOption} type="line" />
      </Grid>
      <Grid size={{ xs: 12 }} sx={dataStyle} aria-hidden={!hasData}>
        <ChartSection option={stackOption} type="bar" />
      </Grid>
    </Grid>
  );
};
