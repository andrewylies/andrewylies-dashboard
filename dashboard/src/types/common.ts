export type Id = number;

export type ProfileKey = 'github' | 'portfolio' | 'linkedin';

export type ProfileItem = {
  key: ProfileKey;
  label: string;
  url: string;
};

export type ErrorProps = {
  title?: string;
  message?: string;
};
