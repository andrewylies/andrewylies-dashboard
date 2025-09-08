import type { EChartsOption } from 'echarts';
import type { Product, Sales } from '@/types/api';
import type { IndexBundle } from '@/lib';

export type Id = number;

export type ProfileKey = 'github' | 'portfolio' | 'linkedin';

export type ProfileItem = {
  /** 메뉴 키 (github | portfolio | linkedin) */
  key: ProfileKey;

  /** 메뉴 라벨 (화면에 표시될 텍스트) */
  label: string;

  /** 링크 URL */
  url: string;
};

export type ErrorProps = {
  /** 에러 제목 */
  title?: string;

  /** 에러 설명 메시지 */
  message?: string;
};

export type ChartProps = {
  /** 매출 데이터 목록 */
  sales: Sales[];

  /** 제품 데이터 목록 */
  products: Product[];

  /** 검색 시작일 (YYYY-MM-DD) */
  start: string;

  /** 검색 종료일 (YYYY-MM-DD) */
  end: string;

  /** 필터 후보 productId 집합 (없으면 전체) */
  candidates?: Set<number>;

  /** 플랫폼별 매출 accessor (Sales → number) */
  getVal: (s: Sales) => number;

  /** 인덱스 번들 (출판사, 장르, 상태, 카테고리, 태그별 인덱스) */
  indexBundle?: IndexBundle;

  /** 로딩 상태 여부 */
  isPending: boolean;
};

/** useChartData 훅이 반환하는 최종 데이터 타입 */
export type UseChartDataResult = {
  /** 데이터 로딩 여부 */
  isPending: boolean;

  /** 라인 차트 옵션 (없으면 undefined) */
  lineOption?: EChartsOption;

  /** 스택(누적) 차트 옵션 (없으면 undefined) */
  stackOption?: EChartsOption;

  /** 파이 차트 옵션 모음 */
  pieOption: {
    /** 매출 기준 파이 차트 옵션 */
    sales?: EChartsOption;

    /** 작품 수 기준 파이 차트 옵션 */
    count?: EChartsOption;
  };

  scatterOption?: EChartsOption;

  /** 날짜 문자열 리스트 (x축용) */
  dateList: string[];

  /** 값 리스트 (y축용) */
  valueList: number[];

  /** 검색 시작일 (YYYY-MM-DD 문자열) */
  start: string;

  /** 검색 종료일 (YYYY-MM-DD 문자열) */
  end: string;
};
