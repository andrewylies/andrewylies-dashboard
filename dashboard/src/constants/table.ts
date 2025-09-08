// 상위 1%
export const TOP_PERCENTILE = 0.99;

// App-heavy (유료 사용자 비중)
export const APP_HEAVY_MIN = 0.6928;

// Web-heavy (유료 사용자 비중)
export const WEB_HEAVY_MAX = 0.675;

// Viral 당일 최소 조회
export const VIRAL_MIN_READ = 4000;

// Viral 당일 전환 최소 비율
export const VIRAL_MIN_RATIO = 0.04;

// Low conversion 총 조회 가드
export const LOW_CONV_MIN_READ = 10000;

// Low conversion 전환 상한
export const LOW_CONV_MAX_RATIO = 0.025;

export const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export const TABLE_COL = {
  THUMB: { HEADER: 'Thumb', MIN_WIDTH: 80 },
  TITLE: { HEADER: 'Title', MIN_WIDTH: 280 },
  PUB: { HEADER: 'Publisher', MIN_WIDTH: 100 },
  GENRE: { HEADER: 'Genre', MIN_WIDTH: 100 },
  CAT: { HEADER: 'Category', MIN_WIDTH: 120 },
  STATUS: { HEADER: 'Status', MIN_WIDTH: 120 },
  TAGS: { HEADER: 'Tags', MIN_WIDTH: 240 },
  SALES: {
    HEADER: 'Sales(₩)',
    MIN_WIDTH: 150,
  },
  BADGES: { HEADER: 'Badges', MIN_WIDTH: 120 },
} as const;

export const BADGE_LABELS = {
  TOP_SELLER: 'Top Seller',
  APP_HEAVY: 'App-heavy',
  WEB_HEAVY: 'Web-heavy',
  VIRAL: 'Viral',
  LOW_CONVERSION: 'Low conversion',
  NEW: 'New',
} as const;

export type BadgeName = (typeof BADGE_LABELS)[keyof typeof BADGE_LABELS];
