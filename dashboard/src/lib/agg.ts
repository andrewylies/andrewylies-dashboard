/**
 * key별 값 합계를 계산해 차트에 쓰기 쉬운 구조로 만든다.
 * @param rows 합계 대상 배열(각 요소: { key, value })
 * @returns labels/data 배열
 */
export const sumByKey = (rows: { key: string; value: number }[]) => {
  const map = new Map<string, number>();
  for (const r of rows) {
    map.set(r.key, (map.get(r.key) ?? 0) + r.value);
  }
  const labels = [...map.keys()];
  const data = [...map.values()];
  return { labels, data };
};

/**
 * key별 합계를 ECharts pie 데이터 형태로 변환한다.
 * @param rows 합계 대상 배열(각 요소: { key, value })
 * @returns [{ name, value }]
 */
export const pieByKey = (rows: { key: string; value: number }[]) => {
  const map = new Map<string, number>();
  for (const r of rows) {
    map.set(r.key, (map.get(r.key) ?? 0) + r.value);
  }
  return [...map.entries()].map(([name, value]) => ({ name, value }));
};

/**
 * 라인 시리즈(x: 날짜 배열, y: 값 배열)를 생성한다.
 * @param rows 배열(각 요소: { date, value })
 * @returns { x, y }
 */
export const makeLineSeries = (rows: { date: string; value: number }[]) => {
  const x = rows.map((r) => r.date);
  const y = rows.map((r) => r.value);
  return { x, y };
};
