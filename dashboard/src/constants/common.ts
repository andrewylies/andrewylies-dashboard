import type { ProfileItem } from '@/types';
export const CHART_SECTION_DEFAULT_HEIGHT = 400;
export const TABLE_SECTION_DEFAULT_HEIGHT = 500;

export const MENU_PROFILE: ProfileItem[] = [
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
];

export const ERROR_MESSAGE = {
  FILTER: {
    START: 'Start date must not be later than end date.',
    END: 'End date must not be earlier than start date.',
  },
};

export const ERROR_CODES = {
  NOT_FOUND: {
    TITLE: 'Page Not Found',
    MESSAGE: 'The page you are looking for does not exist.',
  },
  SERVER_ERROR: {
    TITLE: 'Server Error',
    MESSAGE: 'A server error has occurred. Please try again later.',
  },
  NO_SALES: {
    TITLE: 'No Data Available',
    MESSAGE: 'No sales records match the applied filters.',
  },
};

export const CHART_TEXT = {
  LINE: {
    TEXT: {
      TITLE: 'Sales Trends',
      SUB_TITLE: 'Compare total sales with filtered sales data',
    },
    LEGEND: {
      ALL: 'Total Sales',
      FILTERED: 'Filtered Sales',
    },
    AXIS: {
      Y: '(₩)',
    },
  },
  STACKED_BAR: {
    TEXT: {
      TITLE: 'Sales by Publisher & Category',
      SUB_TITLE: 'Top 10 publishers by sales, stacked by category',
    },
    AXIS: {
      Y: '(₩)',
    },
  },
  PIE: {
    TEXT: {
      TITLE: 'Genre Distribution',
      SUB_TITLE: 'Switch between sales share and title share by genre',
    },
    TOOLTIP: {
      SALES: 'Sales Share',
      COUNT: 'Title Share',
    },
  },
  SCATTER: {
    TEXT: {
      TITLE: 'Sales Conversion Scatter',
      SUB_TITLE: 'Compare viewers and purchasers by title',
    },
    AXIS: {
      X: 'Viewers',
      Y: 'Purchasers',
    },
    VISUAL: {
      HIGH: 'High Sales',
      LOW: 'Low Sales',
    },
    SERIES: 'Sales',
  },
  FALLBACK: {
    GENRE: 'Unclassified',
    CATEGORY: 'Unclassified',
    PUBLISHER: 'Unclassified',
    AUTHOR: 'Unclassified',
    STATUS: 'Unclassified',
    TAG: 'Unclassified',
  },
};

export const PAGE_TEXT = {
  LOADING: 'Fetching secrets from the database…',
  CANCEL: 'Cancel',
  APPLY: 'Apply',
  DASHBOARD: {
    TITLE: 'Sales Overview',
    PLATFORM: {
      ALL: 'View Total Sales',
      APP: 'View App Sales Only',
      WEB: 'View Web Sales Only',
    },
    FILTER: {
      PERIOD: {
        TITLE: 'Period',
        START_DATE: 'Start date',
        END_DATE: 'End date',
      },
      DAYS: {
        SEVEN_DAYS: '7 Days',
        FOURTEEN_DAYS: '14 Days',
        ONE_MONTH: '30 Days',
        THREE_MONTH: '90 Days',
      },
    },
    BUTTON: {
      FILTER: 'Filter',
      CLEAR_ALL: 'Clear All',
    },
    STATUS: {
      SYNCING: 'Syncing data…',
      UPDATED_AT: (time: string) => `Last updated: ${time}`,
    },
  },
  TABLE: {
    TITLE: 'Sales-Filtered Products Overview',
  },
};
