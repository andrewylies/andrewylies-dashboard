import type { ChartProps, DashboardSearch, UseChartDataResult } from '@/types';
import { useChartCommon } from '@/hooks/charts';
import { useLineChart } from '@/hooks/charts';
import { useStackChart } from '@/hooks/charts';
import { usePieChart } from '@/hooks/charts';
import { useScatterChart } from '@/hooks/charts/useScatterChart.ts';

/**
 * 매출 데이터를 기반으로 차트 옵션을 생성하는 훅
 */

interface Props extends UseChartDataResult {
  common: ChartProps;
}

export const useExportChartData = (search: DashboardSearch): Props => {
  const common = useChartCommon(search);
  const { lineOption, dateList, valueList } = useLineChart(common);
  const { stackOption } = useStackChart(common);
  const { pieOption } = usePieChart(common);
  const { scatterOption } = useScatterChart(common);

  return {
    isPending: common.isPending,
    lineOption,
    stackOption,
    pieOption,
    scatterOption,
    dateList,
    valueList,
    common,
    start: common.start,
    end: common.end,
  };
};
