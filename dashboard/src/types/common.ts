export type Id = number;

export type LineSeries = {
  x: string[];
  y: number[];
};

export type StackedSeries = {
  labels: string[];
  data: number[];
};

export type PieDatum = { name: string; value: number };
