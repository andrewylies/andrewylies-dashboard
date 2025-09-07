import type { EChartsOption } from 'echarts';
import type { DashboardSearch } from '@/types';
import { useChartCommon } from '@/hooks/charts/common';
import { useLineChart } from '@/hooks/charts';
import { useStackChart } from '@/hooks/charts';
import { usePieChart } from '@/hooks/charts';

export type UseChartDataResult = {
  /** 데이터 로딩 여부 */
  isPending: boolean;

  /** 라인 차트 옵션 (선택적) */
  lineOption?: EChartsOption;

  /** 스택(누적) 차트 옵션 (선택적) */
  stackOption?: EChartsOption;

  /** 파이 차트 옵션 모음 */
  pieOption: {
    /** 매출 기준 파이 차트 옵션 (선택적) */
    sales?: EChartsOption;

    /** 건수 기준 파이 차트 옵션 (선택적) */
    count?: EChartsOption;
  };

  /** 날짜 문자열 리스트 (x축용) */
  dateList: string[];

  /** 값 리스트 (y축용) */
  valueList: number[];

  /** 검색 시작일 (YYYY-MM-DD 문자열) */
  start: string;

  /** 검색 종료일 (YYYY-MM-DD 문자열) */
  end: string;
};

/**
 * 매출 데이터를 기반으로 차트 옵션을 생성하는 훅
 */

export const useChartData = (search: DashboardSearch): UseChartDataResult => {
  const common = useChartCommon(search);
  const { lineOption, dateList, valueList } = useLineChart(common);
  const { stackOption } = useStackChart(common);
  const { pieOption } = usePieChart(common);

  return {
    isPending: common.isPending,
    lineOption,
    stackOption,
    pieOption,
    dateList,
    valueList,
    start: common.start,
    end: common.end,
  };
};
