/**
 * YYYY-MM-DD 같은 문자열만 허용.
 * - 정규식 /^\d{4}-\d{2}-\d{2}$/ 로 기본적인 패턴만 검증.
 * - 유효하지 않은 날짜(예: 2025-13-40)는 통과할 수 있으므로,
 *   필요하면 dayjs 등 추가 검증 로직을 별도 적용해야 함.
 * @param v 임의 값
 * @returns 유효한 "YYYY-MM-DD" 문자열 또는 undefined
 */
export const sanitizeDate = (v: unknown): string | undefined => {
  if (typeof v !== 'string') return undefined;
  const s = v.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : undefined;
};

/**
 * CSV 문자열(쉼표로 구분된 값)을 정제.
 * - 동작:
 *   1. 공백 제거
 *   2. 빈값 제거
 *   3. 'all' 값 제거 (대소문자 무시)
 *   4. 중복 제거
 *   5. 알파벳 순 정렬 (localeCompare)
 * - 결과가 없으면 undefined 반환.
 *
 * 예시:
 *   " drama, ,all,action ,drama "
 *   -> "action,drama"
 *
 * @param v 임의 값
 * @returns 정제된 CSV 문자열 or undefined
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
 * CSV 문자열을 Set<string>으로 변환.
 * - 빈값/공백 제거.
 * - undefined나 빈 결과면 undefined 반환.
 * @param csv CSV 문자열
 * @returns Set<string> | undefined
 */
export const csvToSet = (csv?: string): Set<string> | undefined => {
  if (!csv) return undefined;
  const set = new Set<string>();
  for (const raw of csv.split(',')) {
    const v = raw.trim();
    if (v) set.add(v);
  }
  return set.size ? set : undefined;
};

/**
 * Set<string> → CSV
 * - 빈 Set이면 undefined 반환(쿼리 제거용)
 * - 정렬 안정화
 * @param set 집합
 */
export const setToCsv = (set: Set<string>) => {
  if (!set.size) return undefined;
  return Array.from(set)
    .sort((a, b) => a.localeCompare(b))
    .join(',');
};

export const csvToSetFiltered = (csv?: string) => {
  if (!csv) return new Set<string>();
  return new Set(
    csv
      .split(',')
      .map((s) => s.trim())
      .filter((v) => v && v.toLowerCase() !== 'all')
  );
};

/**
 * CSV 문자열을 요약 라벨로 변환한다.
 * - 항목 1개 → "라벨: a"
 * - 항목 2개 → "라벨: a, b"
 * - 항목 3개 이상 → "라벨: a, b 외 N"
 *
 * @param label 표시할 필드 라벨 (예: 장르, 출판사)
 * @param csv "a,b,c" 형태의 CSV 문자열
 * @returns 요약된 문자열
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

/** 1/2/5 스텝 올림 라운딩 (축 max 계산용) */
export const niceCeil = (
  v: number,
  steps: number[] = [1, 2, 5, 10]
): number => {
  if (v <= 0) return 1;

  const p = Math.pow(10, Math.floor(Math.log10(v))); // scale factor
  const n = v / p;

  // steps 배열에서 n 이상인 첫 번째 step 선택
  let step = steps[steps.length - 1];
  for (const s of steps) {
    if (n <= s) {
      step = s;
      break;
    }
  }

  return step * p;
};
/** ₩ 통화 축약: 천/만/억 (소수 1자리, .0 제거) */
export const formatKRWShort = (value: number, withSymbol = true) => {
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
