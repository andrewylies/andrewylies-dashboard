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
