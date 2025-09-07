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
];

export const ERROR_MESSAGE = {
  filter: {
    start: 'Start date must not be later than end date.',
    end: 'End date must not be earlier than start date.',
  },
};

export const ERROR_CODES = {
  NOT_FOUND: {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.',
  },
  SERVER_ERROR: {
    title: 'Server Error',
    message: 'A server error has occurred. Please try again later.',
  },
  NO_SALES: {
    title: 'No Data Available',
    message: 'No sales records match the applied filters.',
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
  },
  STACKED_BAR: {
    TEXT: {
      TITLE: 'Sales by Publisher & Category',
      SUB_TITLE: 'Top 10 publishers by sales, stacked by category',
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
};

export const PAGE_TEXT = {
  LOADING: 'Fetching secrets from the database…',
  DASHBOARD: {
    TITLE: 'Overview',
    PLATFORM: {
      ALL: 'Total',
      APP: 'App',
      WEB: 'Web',
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
  },
};
