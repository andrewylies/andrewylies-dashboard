import { useDeferredValue, useMemo, useState } from 'react';
import { Grid } from '@mui/material';
import { useSearch } from '@tanstack/react-router';
import type { DashboardSearch } from '@/types';

import { FilterSearchBar } from '@/components/filter/FilterSearchBar';
import { ChartSection } from '@/components/charts/Section/ChartSection';
import { FilterNoResult } from '@/components/filter/FilterNoResult';
import { useChartData } from '@/hooks/charts';
import {
  PieModeToggle,
  type PieMode,
} from '@/components/charts/Section/PieModeToggleSection';
import { CHART_SECTION_DEFAULT_HEIGHT } from '@/constants/layout';

export const Dashboard = () => {
  // 1) 검색 파라미터 딜레이 적용
  const search: DashboardSearch = useSearch({ from: '/' });
  const deferredSearch = useDeferredValue(search);

  // 2) 차트 데이터 훅
  const { lineOption, stackOption, pieOption, isPending } =
    useChartData(deferredSearch);

  // 3) 파이 모드(매출/작품수) 상태
  const [pieMode, setPieMode] = useState<PieMode>('sales');
  const currentPie = useMemo(
    () => (pieMode === 'sales' ? pieOption.sales : pieOption.count),
    [pieMode, pieOption.sales, pieOption.count]
  );

  const pieDisabled = useMemo(
    () => ({ sales: !pieOption.sales, count: !pieOption.count }),
    [pieOption.sales, pieOption.count]
  );

  const pieToolbar = useMemo(
    () => (
      <PieModeToggle
        mode={pieMode}
        onChange={setPieMode}
        disabled={pieDisabled}
      />
    ),
    [pieMode, pieDisabled]
  );

  // 4) 결과 없음 표시 조건(로딩이 끝났고, 라인/스택 둘 중 하나라도 없음)
  const hasData = !!(lineOption && stackOption);
  const showEmpty = !isPending && !hasData;

  return (
    <Grid container spacing={1} sx={{ pt: 3, pb: 5 }}>
      {/* 검색/필터 바 */}
      <Grid size={{ xs: 12 }}>
        <FilterSearchBar />
      </Grid>

      {/* 결과 없음 */}
      {showEmpty && (
        <Grid size={{ xs: 12 }}>
          <FilterNoResult />
        </Grid>
      )}

      {/* 라인 차트 */}
      <Grid size={{ xs: 12 }}>
        <ChartSection
          option={lineOption}
          type="line"
          isPending={isPending}
          hidden={showEmpty}
          height={CHART_SECTION_DEFAULT_HEIGHT}
        />
      </Grid>

      {/* 스택/파이 차트(반응형 2열) */}
      <Grid size={{ xs: 12, md: 6 }}>
        <ChartSection
          option={stackOption}
          type="bar"
          isPending={isPending}
          hidden={showEmpty}
          height={CHART_SECTION_DEFAULT_HEIGHT}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <ChartSection
          option={currentPie}
          type="pie"
          isPending={isPending}
          hidden={showEmpty}
          height={CHART_SECTION_DEFAULT_HEIGHT}
          toolbar={pieToolbar}
          toolbarKey={pieMode}
        />
      </Grid>
    </Grid>
  );
};
