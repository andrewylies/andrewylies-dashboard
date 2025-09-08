import { useMemo } from 'react';
import {
  Box,
  Chip,
  Stack,
  Typography,
  Avatar,
  Tooltip,
  AvatarGroup,
  useTheme,
  Grid,
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
} from '@mui/x-data-grid';
import type { Product } from '@/types/api/products';
import type { Sales } from '@/types/api/sales';
import {
  STATUS_LABELS,
  CHART_TEXT,
  TABLE_SECTION_DEFAULT_HEIGHT,
  PAGE_TEXT,
} from '@/constants';
import type { ChartProps } from '@/types';

import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import LanguageIcon from '@mui/icons-material/Language';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import dayjs from 'dayjs';
import { useProductsQuery } from '@/hooks/useProductsQuery.ts';

type Row = {
  id: number;
  thumbPath: string;
  title: string;
  publisher: string;
  genre: string;
  category: string;
  status: Product['status'];
  tags: readonly string[];
  salesTotal: number;
  appTotal: number;
  webTotal: number;
  startedSaleAt: string;
  badges: readonly string[];
};

function tsOf(ymd: string): number {
  return new Date(ymd).getTime();
}

export function TableSection({ common }: { common: ChartProps }) {
  const theme = useTheme();
  const { dataUpdatedAt, isFetching } = useProductsQuery();
  const lastUpdated = useMemo(
    () =>
      dataUpdatedAt ? dayjs(dataUpdatedAt).format('YYYY-MM-DD HH:mm:ss') : '—',
    [dataUpdatedAt]
  );

  const { sales, products, start, end, candidates, getVal, isPending } = common;

  const { startTs, endTs } = useMemo(() => {
    const s = start ? tsOf(start) : Number.NEGATIVE_INFINITY;
    const e = end ? tsOf(end) : Number.POSITIVE_INFINITY;
    return { startTs: s, endTs: e };
  }, [start, end]);

  const productAllow = useMemo<Set<number> | undefined>(() => {
    if (candidates && candidates.size > 0) return candidates;
    return undefined;
  }, [candidates]);

  // 제품별 집계: 매출 + 사용자(조회/구매) + 앱/웹 분해 + 일별 전환 확인을 위한 맵
  const aggByProduct = useMemo(() => {
    const map = new Map<
      number,
      {
        sales: { total: number; app: number; web: number };
        users: {
          readTotal: number;
          paidTotal: number;
          appPaid: number;
          webPaid: number;
        };
        daily: Map<string, { read: number; paid: number }>;
      }
    >();

    for (let i = 0; i < sales.length; i++) {
      const row: Sales = sales[i];
      const ts = tsOf(row.salesDate);
      if (ts < startTs || ts > endTs) continue;
      if (productAllow && !productAllow.has(row.productId)) continue;

      let slot = map.get(row.productId);
      if (!slot) {
        slot = {
          sales: { total: 0, app: 0, web: 0 },
          users: { readTotal: 0, paidTotal: 0, appPaid: 0, webPaid: 0 },
          daily: new Map<string, { read: number; paid: number }>(),
        };
        map.set(row.productId, slot);
      }

      // 매출 합산 (표시용)
      slot.sales.total += getVal(row);
      slot.sales.app += row.appSales;
      slot.sales.web += row.webSales;

      // 사용자 합산 (전환 분석용)
      slot.users.readTotal += row.totalReadUser;
      slot.users.paidTotal += row.totalPaidUser;
      slot.users.appPaid += row.appPaidUser;
      slot.users.webPaid += row.webPaidUser;

      // 일별 전환 관측
      const d = slot.daily.get(row.salesDate) ?? { read: 0, paid: 0 };
      d.read += row.totalReadUser;
      d.paid += row.totalPaidUser;
      slot.daily.set(row.salesDate, d);
    }

    return map;
  }, [sales, startTs, endTs, productAllow, getVal]);

  const rows = useMemo<ReadonlyArray<Row>>(() => {
    const list = productAllow
      ? products.filter((p) => productAllow.has(p.productId))
      : products;

    // 상위 매출 기준(Top 1%) 임계 계산
    const totals = list.map(
      (p) => aggByProduct.get(p.productId)?.sales.total ?? 0
    );
    const sortedTotals = [...totals].sort((a, b) => a - b);
    const q90 =
      sortedTotals.length > 0
        ? sortedTotals[Math.max(0, Math.floor(sortedTotals.length * 0.99) - 1)]
        : 0;

    // 배지 생성 로직
    const makeBadges = (p: Product): readonly string[] => {
      const agg = aggByProduct.get(p.productId) ?? {
        sales: { total: 0, app: 0, web: 0 },
        users: { readTotal: 0, paidTotal: 0, appPaid: 0, webPaid: 0 },
        daily: new Map<string, { read: number; paid: number }>(),
      };
      const out: string[] = [];

      // 1) Top Seller (매출 기준 상위 분위)
      if (agg.sales.total >= q90 && agg.sales.total > 0) {
        out.push('Top Seller');
      }

      // 2) New (최근 30일 내 출시)
      const startedTs = p.startedSaleAt ? tsOf(p.startedSaleAt) : 0;
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
      if (startedTs && Date.now() - startedTs < THIRTY_DAYS) {
        out.push('New');
      }

      // 3) App-heavy (이제 PaidUser 기준)
      const paidTotal = agg.users.paidTotal;
      if (paidTotal > 0) {
        const appPaidRatio = agg.users.appPaid / paidTotal;
        if (appPaidRatio >= 0.6928) {
          out.push('App-heavy');
        } else if (appPaidRatio <= 0.675) {
          out.push('Web-heavy');
        }
      }

      // 4) Viral (하루 기준 paid/read >= 0.04인 날 존재 && 그날 read ≥ 4000)
      let hasViral = false;
      for (const v of agg.daily.values()) {
        if (v.read >= 4000 && v.paid / Math.max(1, v.read) >= 0.04) {
          hasViral = true;
          break;
        }
      }
      if (hasViral) out.push('Viral');

      // 5) Low conversion (기간 전체 paid/read < 0.025 && 총 read ≥ 10000)
      if (
        agg.users.readTotal >= 10000 &&
        agg.users.paidTotal / Math.max(1, agg.users.readTotal) < 0.025
      ) {
        out.push('Low conversion');
      }

      return out;
    };

    return list.map<Row>((p) => {
      const agg = aggByProduct.get(p.productId) ?? {
        sales: { total: 0, app: 0, web: 0 },
        users: { readTotal: 0, paidTotal: 0, appPaid: 0, webPaid: 0 },
        daily: new Map<string, { read: number; paid: number }>(),
      };
      return {
        id: p.productId,
        thumbPath: p.thumbPath,
        title: p.title,
        publisher: p.publisher,
        genre: p.genre,
        category: p.category,
        status: p.status,
        tags: p.tags,
        salesTotal: agg.sales.total,
        appTotal: agg.sales.app,
        webTotal: agg.sales.web,
        startedSaleAt: p.startedSaleAt,
        badges: makeBadges(p),
      };
    });
  }, [products, productAllow, aggByProduct]);

  // Table Layout
  const columns = useMemo<ReadonlyArray<GridColDef<Row>>>(
    () => [
      {
        field: 'thumbPath',
        headerName: 'Thumb',
        width: 80,
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        renderCell: (params: GridRenderCellParams<Row, string>) => (
          <Box
            sx={{
              px: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Avatar
              src={params.value || undefined}
              variant="square"
              sx={{ height: '100%' }}
              alt={params.row.title}
            />
          </Box>
        ),
      },
      { field: 'title', headerName: 'Title', minWidth: 280, flex: 1 },
      { field: 'publisher', headerName: 'Publisher', minWidth: 100, flex: 0.6 },
      { field: 'genre', headerName: 'Genre', minWidth: 100, flex: 0.5 },
      { field: 'category', headerName: 'Category', minWidth: 120, flex: 0.5 },
      {
        field: 'status',
        headerName: 'Status',
        minWidth: 120,
        sortable: false,
        renderCell: (params: GridRenderCellParams<Row, Row['status']>) => (
          <Chip
            size="small"
            label={
              params.value
                ? STATUS_LABELS[params.value]
                : CHART_TEXT.FALLBACK.STATUS
            }
            color={
              params.value === 'A'
                ? 'success'
                : params.value === 'I'
                  ? 'warning'
                  : 'default'
            }
            variant="outlined"
            sx={{ borderRadius: 999 }}
          />
        ),
      },
      {
        field: 'tags',
        headerName: 'Tags',
        minWidth: 220,
        flex: 1,
        sortable: false,
        renderCell: (params: GridRenderCellParams<Row, Row['tags']>) => {
          const t = params.value ?? [];
          return (
            <Stack
              direction="row"
              spacing={0.5}
              useFlexGap
              alignItems="center"
              flexWrap="wrap"
              height="100%"
            >
              {t.map((tag) => (
                <Chip
                  key={tag}
                  size="small"
                  label={tag}
                  variant="outlined"
                  sx={{ borderRadius: 999 }}
                />
              ))}
            </Stack>
          );
        },
      },
      {
        field: 'salesTotal',
        headerName: 'Sales(₩)',
        type: 'number',
        minWidth: 150,
      },
      {
        field: 'badges',
        headerName: 'Badges',
        minWidth: 120,
        flex: 1,
        sortable: false,
        renderCell: (params: GridRenderCellParams<Row, Row['badges']>) => {
          const badges = params.value ?? [];

          const renderBadgeAvatar = (note: string) => {
            switch (note) {
              case 'Top Seller':
                return (
                  <Tooltip key={note} title={note} arrow>
                    <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                      <EmojiEventsIcon fontSize="inherit" />
                    </Avatar>
                  </Tooltip>
                );
              case 'App-heavy':
                return (
                  <Tooltip key={note} title={note} arrow>
                    <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                      <PhoneIphoneIcon fontSize="inherit" />
                    </Avatar>
                  </Tooltip>
                );
              case 'Web-heavy':
                return (
                  <Tooltip key={note} title={note} arrow>
                    <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                      <LanguageIcon fontSize="inherit" />
                    </Avatar>
                  </Tooltip>
                );
              case 'Viral':
                return (
                  <Tooltip key={note} title={note} arrow>
                    <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                      <WhatshotIcon fontSize="inherit" />
                    </Avatar>
                  </Tooltip>
                );
              case 'Low conversion':
                return (
                  <Tooltip key={note} title={note} arrow>
                    <Avatar sx={{ bgcolor: theme.palette.error.main }}>
                      <TrendingDownIcon fontSize="inherit" />
                    </Avatar>
                  </Tooltip>
                );
              case 'New':
                return (
                  <Tooltip key={note} title={note} arrow>
                    <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                      <NewReleasesIcon fontSize="inherit" />
                    </Avatar>
                  </Tooltip>
                );
              default:
                return null;
            }
          };

          return (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                width: '100%',
                height: '100%',
              }}
            >
              <AvatarGroup
                spacing={'medium'}
                sx={{
                  '& .MuiAvatar-root': {
                    width: 24,
                    height: 24,
                    fontSize: 14,
                  },
                }}
              >
                {badges.map(renderBadgeAvatar)}
              </AvatarGroup>
            </Box>
          );
        },
      },
    ],
    [theme]
  );

  return (
    <Grid container spacing={5}>
      <Box sx={{ position: 'relative' }}>
        <Typography
          variant="h5"
          fontWeight="bolder"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          {PAGE_TEXT.TABLE.TITLE}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          fontWeight={600}
          sx={{ position: 'absolute', left: 2, bottom: -17, opacity: 0.5 }}
        >
          {isFetching
            ? PAGE_TEXT.DASHBOARD.STATUS.SYNCING
            : PAGE_TEXT.DASHBOARD.STATUS.UPDATED_AT(lastUpdated)}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: TABLE_SECTION_DEFAULT_HEIGHT,
        }}
      >
        <DataGrid
          loading={isPending}
          rows={isPending ? [] : rows}
          columns={columns}
          initialState={{
            sorting: { sortModel: [{ field: 'salesTotal', sort: 'desc' }] },
            pagination: { paginationModel: { page: 0, pageSize: 25 } },
          }}
          pageSizeOptions={[25, 50, 100]}
          disableRowSelectionOnClick
          checkboxSelection={false}
          density="compact"
          sx={{ '& .MuiDataGrid-columnHeaders': { borderRadius: 1 } }}
        />
      </Box>
    </Grid>
  );
}
