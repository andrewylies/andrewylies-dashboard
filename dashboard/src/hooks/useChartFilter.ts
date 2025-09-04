// src/hooks/useDashboardDerived.ts
import { useMemo } from 'react';
import { useProductsQuery } from '@/hooks/useProductsQuery';
import { useSalesQuery } from '@/hooks/useSalesQuery';
import { sortSalesByDate, sliceByDate } from '@/lib/time';
import { joinSalesWithMeta } from '@/lib/join';
import { makeLineSeries, sumByKey, pieByKey } from '@/lib/agg';
import { buildIndexes } from '@/lib/indexers';
import { makeCandidates } from '@/lib/search';
import type {
  DashboardSearch,
  LineSeries,
  StackedSeries,
  PieDatum,
} from '@/types';
import type { Product, Sales } from '@/types/api';
import { DEFAULT_PRESET_KEY, PRESET_RANGES } from '@/constants';

export const useChartFilter = (search: DashboardSearch) => {
  const { data: products = [], isLoading: lp, error: ep } = useProductsQuery();
  const { data: sales = [], isLoading: ls, error: es } = useSalesQuery();

  const isLoading = lp || ls;
  const error = ep || es;

  const idx = useMemo(() => buildIndexes(products), [products]);

  const { sorted: salesSorted, dates: salesDates } = useMemo(
    () => sortSalesByDate<Sales>(sales),
    [sales]
  );

  const candidates = useMemo(
    () =>
      makeCandidates(search, {
        byPublisher: idx.byPublisher,
        byGenre: idx.byGenre,
        byStatus: idx.byStatus,
        byCategory: idx.byCategory,
        byTag: idx.byTag,
      }),
    [
      search,
      idx.byPublisher,
      idx.byGenre,
      idx.byStatus,
      idx.byCategory,
      idx.byTag,
    ]
  );

  const ranged = useMemo(
    () =>
      sliceByDate<Sales>(
        salesSorted,
        salesDates,
        search.start ??
          PRESET_RANGES.find((i) => i.key === DEFAULT_PRESET_KEY)?.get().start,
        search.end ??
          PRESET_RANGES.find((i) => i.key === DEFAULT_PRESET_KEY)?.get().end
      ),
    [salesSorted, salesDates, search.start, search.end]
  );

  const joined = useMemo(
    () => joinSalesWithMeta<Sales, Product>(ranged, idx.pIndex, candidates),
    [ranged, idx.pIndex, candidates]
  );

  const lineSeries: LineSeries = useMemo(() => {
    const rows = joined.map((j) => ({
      date: j.sale.salesDate,
      value: j.sale.totalSales,
    }));
    return makeLineSeries(rows);
  }, [joined]);

  const stackedByPublisherSeries: StackedSeries = useMemo(() => {
    const rows = joined.map((j) => ({
      key: j.meta.publisher,
      value: j.sale.totalSales,
    }));
    return sumByKey(rows);
  }, [joined]);

  const pieByGenreSeries: PieDatum[] = useMemo(() => {
    const rows = joined.map((j) => ({
      key: j.meta.genre,
      value: j.sale.totalSales,
    }));
    return pieByKey(rows);
  }, [joined]);

  return {
    isLoading,
    error,
    joined,
    lineSeries,
    stackedByPublisherSeries,
    pieByGenreSeries,
  };
};
