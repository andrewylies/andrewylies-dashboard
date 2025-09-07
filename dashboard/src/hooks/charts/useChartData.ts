import type { EChartsOption } from 'echarts';
import type { DashboardSearch } from '@/types';
import { useChartCommon } from '@/hooks/charts/common';
import { useLineChart } from '@/hooks/charts';
import { useStackChart } from '@/hooks/charts';
import { usePieChart } from '@/hooks/charts';

export type UseChartDataResult = {
  isPending: boolean;
  lineOption?: EChartsOption;
  stackOption?: EChartsOption;
  pieOption: {
    sales?: EChartsOption;
    count?: EChartsOption;
  };
  dateList: string[];
  valueList: number[];
  start: string;
  end: string;
};

export const useChartData = (search: DashboardSearch): UseChartDataResult => {
  // 공통 (fetch + 기간 + 인덱싱 + candidates + getVal)
  const common = useChartCommon(search);

  // 라인
  const { lineOption, dateList, valueList } = useLineChart(common);

  // 스택 바
  const { stackOption } = useStackChart(common);

  // 파이 — 단일 객체로 묶어서
  const { pieOption } = usePieChart(common);

  return {
    isPending: common.isPending,
    lineOption,
    stackOption,
    pieOption, // { sales?: EChartsOption; count?: EChartsOption }
    dateList,
    valueList,
    start: common.start,
    end: common.end,
  };
};
