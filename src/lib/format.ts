/**
 * "YYYY-MM-DD" 형식 문자열만 통과.
 * (날짜 유효성은 추가 검증 필요)
 */
export const sanitizeDate = (v: unknown): string | undefined => {
  if (typeof v !== 'string') return undefined;
  const s = v.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : undefined;
};

/**
 * CSV 문자열 정제.
 * - 공백/빈값 제거
 * - 'all' 제거(대소문자 무시)
 * - 중복 제거
 * - 알파벳 순 정렬
 */
export const sanitizeCsv = (v: unknown): string | undefined => {
  if (typeof v !== 'string') return undefined;
  const items = v
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s && s.toLowerCase() !== 'all');

  if (items.length === 0) return undefined;
  const uniq = Array.from(new Set(items)).sort((a, b) => a.localeCompare(b));
  return uniq.join(',');
};

/**
 * CSV 문자열을 Set으로 변환
 * - 공백/빈값 제거
 * - removeAll=true 시 'all' 제거
 */
export const csvToSet = (csv?: string, removeAll = false): Set<string> => {
  const set = new Set<string>();
  if (!csv) return set;
  for (const raw of csv.split(',')) {
    const v = raw.trim();
    if (v && (!removeAll || v.toLowerCase() !== 'all')) {
      set.add(v);
    }
  }
  return set;
};

/** Set을 CSV 문자열로 변환 (빈 Set이면 undefined) */
export const setToCsv = (set: Set<string>) => {
  if (!set.size) return undefined;
  return Array.from(set)
    .sort((a, b) => a.localeCompare(b))
    .join(',');
};

/**
 * CSV 문자열 요약 라벨 생성.
 * - 1개: "라벨: a"
 * - 2개: "라벨: a, b"
 * - 3개 이상: "라벨: a, b 외 N"
 */
export const summarizeCsv = (label: string, csv: string): string => {
  const arr = csv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (!arr.length) return '';
  if (arr.length === 1) return `${label}: ${arr[0]}`;
  if (arr.length === 2) return `${label}: ${arr[0]}, ${arr[1]}`;
  return `${label}: ${arr[0]}, ${arr[1]} 외 ${arr.length - 2}`;
};

/** 값의 상한을 1/2/5 계열로 올림 (차트 축 max 계산용) */
export const niceCeil = (v: number): number => {
  if (v <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / p;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * p;
};

/**
 * 원화 단위 축약(K/M/B) 포맷
 * - 음수는 "-₩" 접두
 * - 소수는 1자리 (예: 1.2K)
 * - withSymbol=true → ₩ 표시
 *
 * @example
 *  formatKRWShort(1250, true)  → "₩1.2K"
 *  formatKRWShort(1000, true)  → "₩1K"
 *  formatKRWShort(-950)        → "-950"
 */
export const formatKRWShort = (value: number, withSymbol = false) => {
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  const unit =
    abs >= 1_000_000_000
      ? { v: abs / 1_000_000_000, s: 'B' }
      : abs >= 1_000_000
        ? { v: abs / 1_000_000, s: 'M' }
        : abs >= 1_000
          ? { v: abs / 1_000, s: 'K' }
          : { v: abs, s: '' };

  const formatted = unit.v % 1 === 0 ? unit.v.toString() : unit.v.toFixed(1);
  return `${sign}${withSymbol ? '₩' : ''}${formatted}${unit.s}`;
};
