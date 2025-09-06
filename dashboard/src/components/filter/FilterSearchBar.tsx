import { useMemo, useState, useCallback } from 'react';
import {
  Box,
  Chip,
  Stack,
  styled,
  Badge,
  badgeClasses,
  Button,
  Grid,
  Typography,
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import { useRouter, useSearch } from '@tanstack/react-router';
import type { DashboardSearch } from '@/types';
import { summarizeCsv, buildDateChip, buildMultiChips } from '@/lib';
import { FilterModal } from '@/components/filter/FilterModal.tsx';
import { PlatformQuickSwitch } from '@/components/filter/FilterPlatformSwitch.tsx';
import { PAGE_TEXT } from '@/constants';

export const FilterSearchBar = () => {
  const router = useRouter();
  const search = useSearch({ from: '/' }) as DashboardSearch;
  const [open, setOpen] = useState(false);

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);

  const CartBadge = styled(Badge)`
    & .${badgeClasses.badge} {
      top: -15px;
      right: -15px;
    }
  `;
  const chips = useMemo(() => {
    const dateChip = buildDateChip(search);
    const multi = buildMultiChips(search, summarizeCsv);
    const all = [...(dateChip ? [dateChip] : []), ...multi];

    return all.map((c) => ({
      ...c,
      onDelete:
        c.key === 'date'
          ? () =>
              void router.navigate({
                to: '/',
                search: (prev: DashboardSearch) => ({
                  ...prev,
                  start: undefined,
                  end: undefined,
                }),
              })
          : () =>
              void router.navigate({
                to: '/',
                search: (prev: DashboardSearch) => ({
                  ...prev,
                  [c.key]: undefined,
                }),
              }),
    }));
  }, [router, search]);

  const clearAll = () => {
    const platform = search.platform;
    void router.navigate({
      to: '/',
      replace: true,
      search: (): DashboardSearch => {
        return platform ? { platform } : {};
      },
    });
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="h5" fontWeight={'bolder'}>
              {PAGE_TEXT.DASHBOARD.TITLE}
            </Typography>
            <PlatformQuickSwitch />
          </Box>
        </Grid>
        <Grid
          size={{ xs: 12 }}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          {/* 우측: 필터 버튼 */}
          <Button
            variant={'outlined'}
            onClick={openModal}
            sx={{ whiteSpace: 'nowrap' }}
            color="primary"
            startIcon={<TuneIcon fontSize={'small'} />}
          >
            <Typography fontSize={'small'} fontWeight={'bolder'}>
              {PAGE_TEXT.DASHBOARD.BUTTON.FILTER}
            </Typography>
            <CartBadge
              badgeContent={chips.length}
              color="primary"
              overlap="circular"
            />
          </Button>
          {/* 좌측: 선택된 캡슐 */}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {chips.map((c) => (
              <Chip
                key={String(c.key)}
                label={c.label}
                onDelete={c.onDelete}
                variant="outlined"
                color="primary"
                sx={{ borderRadius: 999 }}
              />
            ))}
            {chips.length > 0 && (
              <Button
                variant="text"
                size="small"
                color="primary"
                onClick={clearAll}
                sx={{ textTransform: 'none' }}
              >
                Clear all
              </Button>
            )}
          </Stack>
        </Grid>
      </Grid>
      <FilterModal open={open} onClose={closeModal} />
    </>
  );
};
