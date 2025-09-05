import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearch } from '@tanstack/react-router';
import dayjs, { Dayjs } from 'dayjs';
import {
  DATE_FORMAT,
  DEFAULT_PRESET_KEY,
  ERROR_MESSAGE,
  MULTI_KEYS,
  PRESET_RANGES,
} from '@/constants';
import { useFilterStore } from '@/stores/filterStore';
import type { DashboardSearch, FilterKey, FilterOptionsMap } from '@/types';
import { csvToSetFiltered, setToCsv } from '@/lib';

type UseFilterModalReturn = {
  /** 선택된 시작일 */
  start: Dayjs | null;

  /** 선택된 종료일 */
  end: Dayjs | null;

  /** 선택된 날짜 프리셋 키 (예: '7d', '14d') */
  presetKey: string | null;

  /** 시작일 검증 에러 메시지 */
  startErrorMsg?: string;

  /** 종료일 검증 에러 메시지 */
  endErrorMsg?: string;

  /** 날짜 범위가 유효하지 않은지 여부 */
  hasDateError: boolean;

  /** 프리셋 버튼 클릭 시 날짜/키 변경 */
  handlePreset: (key: string) => void;

  /** 시작일 변경 핸들러 */
  handleStartChange: (d: Dayjs | null) => void;

  /** 종료일 변경 핸들러 */
  handleEndChange: (d: Dayjs | null) => void;

  /** 필터 옵션 목록 (출판사, 장르, 상태 등) */
  options: FilterOptionsMap;

  /** 각 필터 키별 현재 선택 상태 */
  multi: Record<FilterKey, MultiState>;

  /** 개별 chip 토글 */
  toggleValue: (key: FilterKey, value: string) => void;

  /** "전체" 버튼 클릭 */
  clickAll: (key: FilterKey) => void;

  /** 초기 상태와 비교해 변경이 없는지 여부 */
  isUnchanged: boolean;

  /** 적용 버튼 핸들러 (URL 쿼리 갱신 + 모달 닫기) */
  handleApply: () => void;

  /** 취소 버튼 핸들러 (단순 모달 닫기) */
  handleCancel: () => void;

  /** 모달 열릴 때 URL 검색값을 상태로 동기화 */
  syncOnOpen: () => void;
};

type MultiState = { isAll: boolean; set: Set<string> };
const asAll = (): MultiState => ({ isAll: true, set: new Set() });

type DateRangeState = {
  start: Dayjs | null;
  end: Dayjs | null;
  lastEdited: 'start' | 'end' | null;
  presetKey: string | null;
};

const isAllCovered = (sel: Set<string>, allSet: Set<string>) =>
  sel.size === allSet.size && [...sel].every((v) => allSet.has(v));

const toCsvIfPartial = (st: MultiState, allSet: Set<string>) => {
  if (st.isAll || st.set.size === 0) return undefined;
  if (isAllCovered(st.set, allSet)) return undefined;
  return setToCsv(st.set);
};

const matchPresetKey = (
  start?: Dayjs | null,
  end?: Dayjs | null
): string | null => {
  if (!start || !end) return null;
  const sig = `${start.format(DATE_FORMAT)}|${end.format(DATE_FORMAT)}`;
  const hit = PRESET_RANGES.find((p) => {
    const r = p.get();
    return `${r.start}|${r.end}` === sig;
  });
  return hit?.key ?? null;
};

export const useFilterModal = (onClose: () => void): UseFilterModalReturn => {
  const router = useRouter();
  const search = useSearch({ from: '/' }) as DashboardSearch;
  const options = useFilterStore((s) => s.options);

  const [date, setDate] = useState<DateRangeState>({
    start: null,
    end: null,
    lastEdited: null,
    presetKey: DEFAULT_PRESET_KEY,
  });

  const [multi, setMulti] = useState<Record<FilterKey, MultiState>>(
    () =>
      Object.fromEntries(MULTI_KEYS.map((k) => [k, asAll()])) as Record<
        FilterKey,
        MultiState
      >
  );

  const [initial, setInitial] = useState<{
    start?: string;
    end?: string;
    presetKey: string | null;
    multi: Record<FilterKey, MultiState>;
  } | null>(null);

  const allSets = useMemo(() => {
    const reduce = (arr?: { value: string; label: string }[]) =>
      new Set((arr ?? []).map((o) => o.value).filter((v) => v && v !== 'all'));
    return {
      publisher: reduce(options.publisher),
      genre: reduce(options.genre),
      status: reduce(options.status),
      category: reduce(options.category),
      tags: reduce(options.tags),
    } as Record<FilterKey, Set<string>>;
  }, [options]);

  const initMulti = useCallback(
    (csv?: string, allSet?: Set<string>): MultiState => {
      const parsed = csvToSetFiltered(csv);
      if (!allSet || parsed.size === 0 || isAllCovered(parsed, allSet))
        return asAll();
      return { isAll: false, set: parsed };
    },
    []
  );

  const syncOnOpen = useCallback(() => {
    let s: Dayjs | null;
    let e: Dayjs | null;

    if (search.start || search.end) {
      s = search.start ? dayjs(search.start) : null;
      e = search.end ? dayjs(search.end) : null;
    } else {
      const def = PRESET_RANGES.find((x) => x.key === DEFAULT_PRESET_KEY)!;
      const r = def.get();
      s = dayjs(r.start);
      e = dayjs(r.end);
    }

    const pk = matchPresetKey(s, e);

    setDate({ start: s, end: e, lastEdited: null, presetKey: pk });

    const nextMulti: Record<FilterKey, MultiState> = Object.fromEntries(
      MULTI_KEYS.map((k) => [k, initMulti(search[k], allSets[k])])
    ) as Record<FilterKey, MultiState>;

    setMulti(nextMulti);

    setInitial({
      start: s ? s.format(DATE_FORMAT) : undefined,
      end: e ? e.format(DATE_FORMAT) : undefined,
      presetKey: pk,
      multi: nextMulti,
    });
  }, [search, allSets, initMulti]);

  const toggleValue = useCallback(
    (key: FilterKey, value: string) => {
      setMulti((prev) => {
        const target = prev[key];
        if (target.isAll) {
          return { ...prev, [key]: { isAll: false, set: new Set([value]) } };
        }
        const next = new Set(target.set);
        if (next.has(value)) next.delete(value);
        else next.add(value);
        if (next.size === 0) {
          return {
            ...prev,
            [key]: { isAll: true, set: new Set<string>() },
          } as any;
        }
        return {
          ...prev,
          [key]: isAllCovered(next, allSets[key])
            ? asAll()
            : { isAll: false, set: next },
        };
      });
    },
    [allSets]
  );

  const clickAll = useCallback((key: FilterKey) => {
    setMulti((prev) => ({ ...prev, [key]: asAll() }));
  }, []);

  const handlePreset = useCallback((key: string) => {
    const p = PRESET_RANGES.find((x) => x.key === key);
    if (!p) return;
    const r = p.get();
    setDate({
      start: dayjs(r.start),
      end: dayjs(r.end),
      lastEdited: null,
      presetKey: key,
    });
  }, []);

  const handleStartChange = useCallback((d: Dayjs | null) => {
    setDate((prev) => ({
      ...prev,
      start: d,
      lastEdited: 'start',
      presetKey: matchPresetKey(d, prev.end),
    }));
  }, []);

  const handleEndChange = useCallback((d: Dayjs | null) => {
    setDate((prev) => ({
      ...prev,
      end: d,
      lastEdited: 'end',
      presetKey: matchPresetKey(prev.start, d),
    }));
  }, []);

  const bothFilled = Boolean(date.start && date.end);
  const reversed = bothFilled ? date.end!.isBefore(date.start!, 'day') : false;
  const startErrorMsg =
    bothFilled && reversed && date.lastEdited === 'start'
      ? ERROR_MESSAGE.filter.start
      : undefined;
  const endErrorMsg =
    bothFilled && reversed && date.lastEdited === 'end'
      ? ERROR_MESSAGE.filter.end
      : undefined;
  const hasDateError = reversed;

  const isUnchanged = useMemo(() => {
    if (!initial) return true;
    const s = date.start ? date.start.format(DATE_FORMAT) : undefined;
    const e = date.end ? date.end.format(DATE_FORMAT) : undefined;

    const eqMulti = (a: MultiState, b: MultiState) =>
      a.isAll === b.isAll &&
      a.set.size === b.set.size &&
      [...a.set].every((v) => b.set.has(v));

    return (
      initial.start === s &&
      initial.end === e &&
      initial.presetKey === date.presetKey &&
      MULTI_KEYS.every((k) => eqMulti(initial.multi[k], multi[k]))
    );
  }, [initial, date, multi]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleApply = useCallback(() => {
    if (hasDateError || isUnchanged) return;
    const s = date.start ? date.start.format(DATE_FORMAT) : undefined;
    const e = date.end ? date.end.format(DATE_FORMAT) : undefined;

    void router.navigate({
      to: '/',
      search: (prev: DashboardSearch) => {
        const next = { ...prev, start: s, end: e };
        MULTI_KEYS.forEach((k) => {
          next[k] = toCsvIfPartial(multi[k], allSets[k]);
        });
        return next;
      },
    });
    onClose();
  }, [router, onClose, hasDateError, isUnchanged, date, multi, allSets]);

  return {
    start: date.start,
    end: date.end,
    presetKey: date.presetKey,
    startErrorMsg,
    endErrorMsg,
    hasDateError,
    handlePreset,
    handleStartChange,
    handleEndChange,
    options,
    multi,
    toggleValue,
    clickAll,
    isUnchanged,
    handleApply,
    handleCancel,
    syncOnOpen,
  };
};
