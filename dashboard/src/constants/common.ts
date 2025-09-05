export const MENU_PROFILE = [
  {
    key: 'portfolio',
    label: 'Portfolio',
    url: 'https://dev-opera.vercel.app/',
  },
  { key: 'github', label: 'GitHub', url: 'https://github.com/andrewylies' },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    url: 'https://www.linkedin.com/in/andrewylies',
  },
] as const;

export const ERROR_MESSAGE = {
  filter: {
    start: '시작일이 종료일보다 늦습니다.',
    end: '종료일이 시작일 보다 빠릅니다.',
  },
};

export const ERROR_CODES = {
  NOT_FOUND: {
    title: 'NOT FOUND',
    message: '페이지를 찾을 수 없습니다.',
  },
  SERVER_ERROR: {
    title: 'SERVER ERROR',
    message: '서버에서 오류가 발생했습니다.',
  },
  NO_SALES: {
    title: 'NO SALES',
    message: '선택한 기간에는 매출 데이터가 없습니다.',
  },
} as const;

export const CHART_TEXT = {
  TITLE: {
    LINE: '기간별 매출 추이',
  },
  LEGEND: {
    ALL: '전체 매출',
    FILTERED: '선택 매출',
  },
};
