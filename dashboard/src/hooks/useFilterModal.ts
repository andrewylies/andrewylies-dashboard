import { useCallback, useMemo, useState } from 'react';
import { useRouter, useSearch } from '@tanstack/react-router';
import dayjs, { Dayjs } from 'dayjs';
import {
  DATE_FORMAT,
  DEFAULT_PRESET_KEY,
  ERROR_MESSAGE,
  PRESET_RANGES,
} from '@/constants';
import { useFilterStore } from '@/stores/filterStore';
import type { DashboardSearch } from '@/types';
import { csvToSetFiltered, setToCsv } from '@/lib/string';

type MultiState = { isAll: boolean; set: Set<string> };
type EditedField = 'start' | 'end' | null;

const asAll = (): MultiState => ({ isAll: true, set: new Set() });

/** 모든 후보(allSet)를 정확히 포함하면 '전체'로 간주 */
const isAllCovered = (sel: Set<string>, allSet: Set<string>) =>
  sel.size === allSet.size && [...sel].every((v) => allSet.has(v));

/** '전체'이면 undefined, 부분선택만 CSV 직렬화 */
const toCsvIfPartial = (st: MultiState, allSet: Set<string>) => {
  if (st.isAll || st.set.size === 0) return undefined;
  if (isAllCovered(st.set, allSet)) return undefined;
  return setToCsv(st.set);
};

/** 프리셋 키 매칭: (start,end) 포맷을 묶어 빠르게 비교 */
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

export const useFilterModal = (onClose: () => void) => {
  const router = useRouter();
  const search = useSearch({ from: '/' }) as DashboardSearch;
  const options = useFilterStore((s) => s.options);

  // 날짜
  const [start, setStart] = useState<Dayjs | null>(null);
  const [end, setEnd] = useState<Dayjs | null>(null);
  const [presetKey, setPresetKey] = useState<string | null>(DEFAULT_PRESET_KEY);
  const [lastEdited, setLastEdited] = useState<EditedField>(null);

  // 다중 필터 상태
  const [pubState, setPubState] = useState<MultiState>(asAll());
  const [genState, setGenState] = useState<MultiState>(asAll());
  const [staState, setStaState] = useState<MultiState>(asAll());
  const [catState, setCatState] = useState<MultiState>(asAll());
  const [tagState, setTagState] = useState<MultiState>(asAll());

  // 초기 스냅샷 (Apply 비활성화 판단용)
  const [initial, setInitial] = useState<{
    start?: string;
    end?: string;
    presetKey: string | null;
    pub: MultiState;
    gen: MultiState;
    sta: MultiState;
    cat: MultiState;
    tag: MultiState;
  } | null>(null);

  /** 전체 집합(Set) 계산: options → Set<string> */
  const allSets = useMemo(() => {
    const prune = (arr?: { value: string; label: string }[]) =>
      new Set((arr ?? []).map((o) => o.value).filter((v) => v && v !== 'all'));
    return {
      publisher: prune(options.publisher),
      genre: prune(options.genre),
      status: prune(options.status),
      category: prune(options.category),
      tags: prune(options.tags),
    };
  }, [
    options.publisher,
    options.genre,
    options.status,
    options.category,
    options.tags,
  ]);

  /** URL(csv) → MultiState 초기화 */
  const initMulti = useCallback(
    (csv?: string, allSet?: Set<string>): MultiState => {
      const parsed = csvToSetFiltered(csv);
      if (!allSet || parsed.size === 0 || isAllCovered(parsed, allSet))
        return asAll();
      return { isAll: false, set: parsed };
    },
    []
  );

  /** 모달 열릴 때 URL → 로컬 상태 동기화 */
  const syncOnOpen = useCallback(() => {
    // 날짜
    let s: Dayjs | null;
    let e: Dayjs | null;
    let pk: string | null;

    if (search.start || search.end) {
      s = search.start ? dayjs(search.start) : null;
      e = search.end ? dayjs(search.end) : null;
      pk = matchPresetKey(s, e);
    } else {
      const def = PRESET_RANGES.find((x) => x.key === DEFAULT_PRESET_KEY)!;
      const r = def.get();
      s = dayjs(r.start);
      e = dayjs(r.end);
      pk = DEFAULT_PRESET_KEY;
    }

    setStart(s);
    setEnd(e);
    setPresetKey(pk);
    setLastEdited(null);

    // 다중 필터
    const pub = initMulti(search.publisher, allSets.publisher);
    const gen = initMulti(search.genre, allSets.genre);
    const sta = initMulti(search.status, allSets.status);
    const cat = initMulti(search.category, allSets.category);
    const tag = initMulti(search.tags, allSets.tags);

    setPubState(pub);
    setGenState(gen);
    setStaState(sta);
    setCatState(cat);
    setTagState(tag);

    setInitial({
      start: s ? s.format(DATE_FORMAT) : undefined,
      end: e ? e.format(DATE_FORMAT) : undefined,
      presetKey: pk,
      pub,
      gen,
      sta,
      cat,
      tag,
    });
  }, [
    search.start,
    search.end,
    search.publisher,
    search.genre,
    search.status,
    search.category,
    search.tags,
    allSets.publisher,
    allSets.genre,
    allSets.status,
    allSets.category,
    allSets.tags,
    initMulti,
  ]);

  /** 프리셋 버튼 */
  const handlePreset = useCallback((key: string) => {
    const p = PRESET_RANGES.find((x) => x.key === key);
    if (!p) return;
    const r = p.get();
    setStart(dayjs(r.start));
    setEnd(dayjs(r.end));
    setPresetKey(key);
    setLastEdited(null);
  }, []);

  /** 날짜 입력 변경 */
  const handleStartChange = useCallback(
    (d: Dayjs | null) => {
      setStart(d);
      setLastEdited('start');
      setPresetKey(matchPresetKey(d, end));
    },
    [end]
  );

  const handleEndChange = useCallback(
    (d: Dayjs | null) => {
      setEnd(d);
      setLastEdited('end');
      setPresetKey(matchPresetKey(start, d));
    },
    [start]
  );

  /** 날짜 검증 */
  const bothFilled = Boolean(start && end);
  const reversed = bothFilled ? end!.isBefore(start!, 'day') : false;
  const startErrorMsg = useMemo(
    () =>
      bothFilled && reversed && lastEdited === 'start'
        ? ERROR_MESSAGE.filter.start
        : undefined,
    [bothFilled, reversed, lastEdited]
  );
  const endErrorMsg = useMemo(
    () =>
      bothFilled && reversed && lastEdited === 'end'
        ? ERROR_MESSAGE.filter.end
        : undefined,
    [bothFilled, reversed, lastEdited]
  );
  const hasDateError = reversed;

  /** 다중 필터 토글 (functional setState로 의존성 안전) */
  const togglePublisher = useCallback(
    (value: string) =>
      setPubState((prev) => {
        if (prev.isAll) return { isAll: false, set: new Set([value]) };
        const next = new Set(prev.set);
        if (next.has(value)) {
          next.delete(value);
        } else {
          next.add(value);
        }
        return isAllCovered(next, allSets.publisher)
          ? asAll()
          : { isAll: false, set: next };
      }),
    [allSets.publisher]
  );
  const toggleGenre = useCallback(
    (value: string) =>
      setGenState((prev) => {
        if (prev.isAll) return { isAll: false, set: new Set([value]) };
        const next = new Set(prev.set);
        if (next.has(value)) {
          next.delete(value);
        } else {
          next.add(value);
        }
        return isAllCovered(next, allSets.genre)
          ? asAll()
          : { isAll: false, set: next };
      }),
    [allSets.genre]
  );
  const toggleStatus = useCallback(
    (value: string) =>
      setStaState((prev) => {
        if (prev.isAll) return { isAll: false, set: new Set([value]) };
        const next = new Set(prev.set);
        if (next.has(value)) {
          next.delete(value);
        } else {
          next.add(value);
        }
        return isAllCovered(next, allSets.status)
          ? asAll()
          : { isAll: false, set: next };
      }),
    [allSets.status]
  );
  const toggleCategory = useCallback(
    (value: string) =>
      setCatState((prev) => {
        if (prev.isAll) return { isAll: false, set: new Set([value]) };
        const next = new Set(prev.set);
        if (next.has(value)) {
          next.delete(value);
        } else {
          next.add(value);
        }
        return isAllCovered(next, allSets.category)
          ? asAll()
          : { isAll: false, set: next };
      }),
    [allSets.category]
  );
  const toggleTags = useCallback(
    (value: string) =>
      setTagState((prev) => {
        if (prev.isAll) return { isAll: false, set: new Set([value]) };
        const next = new Set(prev.set);
        if (next.has(value)) {
          next.delete(value);
        } else {
          next.add(value);
        }
        return isAllCovered(next, allSets.tags)
          ? asAll()
          : { isAll: false, set: next };
      }),
    [allSets.tags]
  );

  /** 전체 버튼 */
  const clickAllPublisher = useCallback(() => setPubState(asAll()), []);
  const clickAllGenre = useCallback(() => setGenState(asAll()), []);
  const clickAllStatus = useCallback(() => setStaState(asAll()), []);
  const clickAllCategory = useCallback(() => setCatState(asAll()), []);
  const clickAllTags = useCallback(() => setTagState(asAll()), []);

  /** 변경 여부(Apply 비활성화 판단) */
  const isUnchanged = useMemo(() => {
    if (!initial) return true;
    const s = start ? start.format(DATE_FORMAT) : undefined;
    const e = end ? end.format(DATE_FORMAT) : undefined;

    const eqMulti = (a: MultiState, b: MultiState) =>
      a.isAll === b.isAll &&
      a.set.size === b.set.size &&
      [...a.set].every((v) => b.set.has(v));

    return (
      initial.start === s &&
      initial.end === e &&
      initial.presetKey === presetKey &&
      eqMulti(initial.pub, pubState) &&
      eqMulti(initial.gen, genState) &&
      eqMulti(initial.sta, staState) &&
      eqMulti(initial.cat, catState) &&
      eqMulti(initial.tag, tagState)
    );
  }, [
    initial,
    start,
    end,
    presetKey,
    pubState,
    genState,
    staState,
    catState,
    tagState,
  ]);

  /** 액션 */
  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleApply = useCallback(() => {
    if (hasDateError || isUnchanged) return;
    const s = start ? start.format(DATE_FORMAT) : undefined;
    const e = end ? end.format(DATE_FORMAT) : undefined;

    void router.navigate({
      to: '/',
      search: (prev: DashboardSearch) => ({
        ...prev,
        start: s,
        end: e,
        publisher: toCsvIfPartial(pubState, allSets.publisher),
        genre: toCsvIfPartial(genState, allSets.genre),
        status: toCsvIfPartial(staState, allSets.status),
        category: toCsvIfPartial(catState, allSets.category),
        tags: toCsvIfPartial(tagState, allSets.tags),
      }),
    });
    onClose();
  }, [
    router,
    onClose,
    hasDateError,
    isUnchanged,
    start,
    end,
    pubState,
    genState,
    staState,
    catState,
    tagState,
    allSets.publisher,
    allSets.genre,
    allSets.status,
    allSets.category,
    allSets.tags,
  ]);

  return {
    // 날짜
    start,
    end,
    presetKey,
    startErrorMsg,
    endErrorMsg,
    hasDateError,
    isUnchanged,
    handlePreset,
    handleStartChange,
    handleEndChange,

    // 옵션/상태
    options,
    pubState,
    genState,
    staState,
    catState,
    tagState,

    // 토글/전체
    clickAllPublisher,
    clickAllGenre,
    clickAllStatus,
    clickAllCategory,
    clickAllTags,
    togglePublisher,
    toggleGenre,
    toggleStatus,
    toggleCategory,
    toggleTags,

    // 액션
    handleApply,
    handleCancel,

    // 라이프사이클
    syncOnOpen,
  };
};
