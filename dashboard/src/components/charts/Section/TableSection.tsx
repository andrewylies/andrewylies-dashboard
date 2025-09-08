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
  TOP_PERCENTILE,
  THIRTY_DAYS_MS,
  APP_HEAVY_MIN,
  WEB_HEAVY_MAX,
  VIRAL_MIN_READ,
  VIRAL_MIN_RATIO,
  LOW_CONV_MIN_READ,
  LOW_CONV_MAX_RATIO,
  BADGE_LABELS,
  type BadgeName,
  TABLE_COL,
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
import { tsOf } from '@/lib';

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
  badges: readonly BadgeName[];
};

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

  // 제품별 집계
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

      // 매출 합산
      slot.sales.total += getVal(row);
      slot.sales.app += row.appSales;
      slot.sales.web += row.webSales;

      // 사용자 합산
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

    // 상위 매출 기준(Top %) 임계 계산
    const totals = list.map(
      (p) => aggByProduct.get(p.productId)?.sales.total ?? 0
    );
    let topThreshold = 0;
    if (totals.length > 0) {
      const sorted = [...totals].sort((a, b) => a - b);
      const idx = Math.max(0, Math.floor(sorted.length * TOP_PERCENTILE) - 1);
      topThreshold = sorted[idx];
    }

    const now = Date.now();

    // 배지 생성
    const makeBadges = (p: Product): readonly BadgeName[] => {
      const agg = aggByProduct.get(p.productId) ?? {
        sales: { total: 0, app: 0, web: 0 },
        users: { readTotal: 0, paidTotal: 0, appPaid: 0, webPaid: 0 },
        daily: new Map<string, { read: number; paid: number }>(),
      };

      const out: BadgeName[] = [];

      // Top Seller
      if (agg.sales.total > 0 && agg.sales.total >= topThreshold) {
        out.push(BADGE_LABELS.TOP_SELLER);
      }

      // New (최근 30일)
      const startedTs = p.startedSaleAt ? tsOf(p.startedSaleAt) : 0;
      if (startedTs && now - startedTs < THIRTY_DAYS_MS) {
        out.push(BADGE_LABELS.NEW);
      }

      // App-heavy / Web-heavy (PaidUser 기준)
      const paidTotal = agg.users.paidTotal;
      if (paidTotal > 0) {
        const appPaidRatio = agg.users.appPaid / paidTotal;
        if (appPaidRatio >= APP_HEAVY_MIN) {
          out.push(BADGE_LABELS.APP_HEAVY);
        } else if (appPaidRatio <= WEB_HEAVY_MAX) {
          out.push(BADGE_LABELS.WEB_HEAVY);
        }
      }

      // Viral (하루 기준)
      let hasViral = false;
      for (const v of agg.daily.values()) {
        const reads = v.read;
        const conv = v.paid / (reads > 0 ? reads : 1);
        if (reads >= VIRAL_MIN_READ && conv >= VIRAL_MIN_RATIO) {
          hasViral = true;
          break;
        }
      }
      if (hasViral) out.push(BADGE_LABELS.VIRAL);

      // Low conversion (기간 전체)
      if (agg.users.readTotal >= LOW_CONV_MIN_READ) {
        const convAll =
          agg.users.paidTotal /
          (agg.users.readTotal > 0 ? agg.users.readTotal : 1);
        if (convAll < LOW_CONV_MAX_RATIO) out.push(BADGE_LABELS.LOW_CONVERSION);
      }

      return out;
    };

    return list.map<Row>((p) => {
      const agg = aggByProduct.get(p.productId) ?? {
        sales: { total: 0, app: 0, web: 0 },
        users: { readTotal: 0, paidTotal: 0, appPaid: 0, webPaid: 0 },
        daily: new Map<string, { read: 0; paid: 0 }>(),
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
        headerName: TABLE_COL.THUMB.HEADER,
        width: TABLE_COL.THUMB.MIN_WIDTH,
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
              width: '100%',
              height: '100%',
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
      {
        field: 'title',
        headerName: TABLE_COL.TITLE.HEADER,
        minWidth: TABLE_COL.TITLE.MIN_WIDTH,
        flex: 1,
      },
      {
        field: 'publisher',
        headerName: TABLE_COL.PUB.HEADER,
        minWidth: TABLE_COL.PUB.MIN_WIDTH,
        flex: 0.6,
      },
      {
        field: 'genre',
        headerName: TABLE_COL.GENRE.HEADER,
        minWidth: TABLE_COL.GENRE.MIN_WIDTH,
        flex: 0.5,
      },
      {
        field: 'category',
        headerName: TABLE_COL.CAT.HEADER,
        minWidth: TABLE_COL.CAT.MIN_WIDTH,
        flex: 0.5,
      },
      {
        field: 'status',
        headerName: TABLE_COL.STATUS.HEADER,
        minWidth: TABLE_COL.STATUS.MIN_WIDTH,
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
        headerName: TABLE_COL.TAGS.HEADER,
        minWidth: TABLE_COL.TAGS.MIN_WIDTH,
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
        headerName: TABLE_COL.SALES.HEADER,
        type: 'number',
        minWidth: TABLE_COL.SALES.MIN_WIDTH,
      },
      {
        field: 'badges',
        headerName: TABLE_COL.BADGES.HEADER,
        minWidth: TABLE_COL.BADGES.MIN_WIDTH,
        flex: 1,
        sortable: false,
        renderCell: (params: GridRenderCellParams<Row, Row['badges']>) => {
          const badges = params.value ?? [];

          const renderBadgeAvatar = (note: BadgeName) => {
            switch (note) {
              case BADGE_LABELS.TOP_SELLER:
                return (
                  <Tooltip key={note} title={note} arrow>
                    <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                      <EmojiEventsIcon fontSize="inherit" />
                    </Avatar>
                  </Tooltip>
                );
              case BADGE_LABELS.APP_HEAVY:
                return (
                  <Tooltip key={note} title={note} arrow>
                    <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                      <PhoneIphoneIcon fontSize="inherit" />
                    </Avatar>
                  </Tooltip>
                );
              case BADGE_LABELS.WEB_HEAVY:
                return (
                  <Tooltip key={note} title={note} arrow>
                    <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                      <LanguageIcon fontSize="inherit" />
                    </Avatar>
                  </Tooltip>
                );
              case BADGE_LABELS.VIRAL:
                return (
                  <Tooltip key={note} title={note} arrow>
                    <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                      <WhatshotIcon fontSize="inherit" />
                    </Avatar>
                  </Tooltip>
                );
              case BADGE_LABELS.LOW_CONVERSION:
                return (
                  <Tooltip key={note} title={note} arrow>
                    <Avatar sx={{ bgcolor: theme.palette.error.main }}>
                      <TrendingDownIcon fontSize="inherit" />
                    </Avatar>
                  </Tooltip>
                );
              case BADGE_LABELS.NEW:
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
                spacing="medium"
                sx={{
                  '& .MuiAvatar-root': { width: 24, height: 24, fontSize: 14 },
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
    <Grid container spacing={4}>
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
          width: '100%',
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
          density="compact"
        />
      </Box>
    </Grid>
  );
}

export default TableSection;
