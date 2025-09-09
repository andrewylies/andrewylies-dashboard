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
import { csvToSet, setToCsv } from '@/lib';

type MultiState = { isAll: boolean; set: Set<string> };
const asAll = (): MultiState => ({ isAll: true, set: new Set() });

type DateVM = {
  start: Dayjs | null;
  end: Dayjs | null;
  presetKey: string | null;
};

type DateRangeState = {
  start: Dayjs | null;
  end: Dayjs | null;
  lastEdited: 'start' | 'end' | null;
  presetKey: string | null;
};

/** 훅 반환 타입(그룹화) */
export type UseFilterModalVM = {
  /** 필터 모달 상태 */
  state: {
    /** 날짜 상태 (시작/종료/프리셋) */
    date: DateVM;
    /** 멀티 선택 상태 (publisher/genre/...) */
    multi: Record<FilterKey, MultiState>;
    /** 각 키별 필터 옵션 목록 */
    options: FilterOptionsMap;
  };
  /** 에러 메시지 모음 */
  errors: {
    /** 시작일 에러 메시지 */
    start?: string;
    /** 종료일 에러 메시지 */
    end?: string;
  };
  /** 상태 플래그 */
  flags: {
    /** 날짜 범위가 잘못되었는지 여부 */
    hasDateError: boolean;
    /** 초기 상태와 비교해 변경이 없는지 여부 */
    isUnchanged: boolean;
  };
  /** 모달 동작 */
  actions: {
    /** 프리셋 버튼 클릭 */
    preset: (key: string) => void;
    /** 시작일 변경 */
    setStart: (d: Dayjs | null) => void;
    /** 종료일 변경 */
    setEnd: (d: Dayjs | null) => void;
    /** 개별 값 토글 */
    toggle: (key: FilterKey, value: string) => void;
    /** 전체 선택 */
    selectAll: (key: FilterKey) => void;
    /** 적용 (쿼리 반영 + 닫기) */
    apply: () => void;
    /** 취소 (닫기) */
    cancel: () => void;
    /** 모달 오픈 시 URL 검색값을 상태로 동기화 */
    syncOnOpen: () => void;
  };
};

const isAllCovered = (sel: Set<string>, allSet: Set<string>): boolean =>
  sel.size === allSet.size && [...sel].every((v) => allSet.has(v));

const toCsvIfPartial = (
  st: MultiState,
  allSet: Set<string>
): string | undefined => {
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

/** 필터 모달용 상태/동작 훅 (그룹화된 반환) */
export const useFilterModal = (onClose: () => void): UseFilterModalVM => {
  const router = useRouter();
  const search = useSearch({ from: '/' });
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

  /** 각 필터키의 전체 옵션 집합 */
  const allSets: Record<FilterKey, Set<string>> = useMemo(() => {
    const reduce = (arr?: { value: string; label: string }[]) =>
      new Set((arr ?? []).map((o) => o.value).filter((v) => v && v !== 'all'));
    return {
      publisher: reduce(options.publisher),
      genre: reduce(options.genre),
      status: reduce(options.status),
      category: reduce(options.category),
      tags: reduce(options.tags),
    };
  }, [options]);

  /** CSV를 초기 MultiState로 변환 */
  const initMulti = useCallback(
    (csv?: string, allSet?: Set<string>): MultiState => {
      const parsed = csvToSet(csv, true);
      if (
        !parsed ||
        !allSet ||
        parsed.size === 0 ||
        isAllCovered(parsed, allSet)
      )
        return asAll();
      return { isAll: false, set: parsed };
    },
    []
  );

  /** 모달 오픈 시 URL 검색값으로 상태 동기화 */
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

  /** 개별 값 토글 */
  const toggle = useCallback(
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
          return { ...prev, [key]: asAll() };
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

  /** 전체 선택 */
  const selectAll = useCallback((key: FilterKey) => {
    setMulti((prev) => ({ ...prev, [key]: asAll() }));
  }, []);

  /** 프리셋 선택 */
  const preset = useCallback((key: string) => {
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

  /** 시작일 변경 */
  const setStart = useCallback((d: Dayjs | null) => {
    setDate((prev) => ({
      ...prev,
      start: d,
      lastEdited: 'start',
      presetKey: matchPresetKey(d, prev.end),
    }));
  }, []);

  /** 종료일 변경 */
  const setEnd = useCallback((d: Dayjs | null) => {
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
      ? ERROR_MESSAGE.FILTER.START
      : undefined;
  const endErrorMsg =
    bothFilled && reversed && date.lastEdited === 'end'
      ? ERROR_MESSAGE.FILTER.END
      : undefined;
  const hasDateError = reversed;

  /** 변경 여부 플래그 */
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

  /** 취소(닫기) */
  const cancel = useCallback(() => {
    onClose();
  }, [onClose]);

  /** 적용(쿼리 반영 후 닫기) */
  const apply = useCallback(() => {
    if (hasDateError || isUnchanged) return;

    const s = date.start ? date.start.format(DATE_FORMAT) : undefined;
    const e = date.end ? date.end.format(DATE_FORMAT) : undefined;

    const multiPatch: Partial<Record<FilterKey, string | undefined>> = {};
    MULTI_KEYS.forEach((k) => {
      multiPatch[k] = toCsvIfPartial(multi[k], allSets[k]);
    });

    void router.navigate({
      to: '/',
      search: (prev: DashboardSearch) => ({
        ...prev,
        start: s,
        end: e,
        ...multiPatch,
      }),
    });

    onClose();
  }, [router, onClose, hasDateError, isUnchanged, date, multi, allSets]);

  return {
    state: {
      date: { start: date.start, end: date.end, presetKey: date.presetKey },
      multi,
      options,
    },
    errors: {
      start: startErrorMsg,
      end: endErrorMsg,
    },
    flags: {
      hasDateError,
      isUnchanged,
    },
    actions: {
      preset,
      setStart,
      setEnd,
      toggle,
      selectAll,
      apply,
      cancel,
      syncOnOpen,
    },
  };
};
