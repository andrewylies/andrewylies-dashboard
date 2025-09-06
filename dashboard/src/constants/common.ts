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
    start: 'Start date must not be later than end date.',
    end: 'End date must not be earlier than start date.',
  },
};

export const ERROR_CODES = {
  NOT_FOUND: {
    title: 'Not Found',
    message: 'The page you are looking for does not exist.',
  },
  SERVER_ERROR: {
    title: 'Server Error',
    message: 'A server error has occurred. Please try again later.',
  },
  NO_SALES: {
    title: 'No Sales Data',
    message: 'No sales records found for the selected period.',
  },
} as const;

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
  },
};

export const PAGE_TEXT = {
  DASHBOARD: {
    TITLE: 'Overview',
    PLATFORM: {
      ALL: 'Total Sales',
      APP: 'App Sales',
      WEB: 'Web Sales',
    },
    BUTTON: {
      FILTER: 'Filter',
    },
  },
};
