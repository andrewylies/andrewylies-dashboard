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
import type { DashboardSearch, FilterKey } from '@/types';
import { summarizeCsv, buildDateChip, buildMultiChips } from '@/lib';
import { FilterModal } from '@/components/filter/FilterModal.tsx';
import { PlatformQuickSwitch } from '@/components/filter/FilterPlatformSwitch.tsx';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { PAGE_TEXT } from '@/constants';

const CartBadge = styled(Badge)`
  & .${badgeClasses.badge} {
    top: -15px;
    right: -15px;
  }
`;

const MotionBox = motion.div;
const MOTION_TRANSITION = { duration: 0.15, ease: [0.22, 1, 0.36, 1] } as const;
const MOTION_INIT = { opacity: 0 } as const;
const MOTION_ANIM = { opacity: 1 } as const;
const MOTION_EXIT = { opacity: 0, scale: 0.8 } as const;

export const FilterSearchBar = () => {
  const router = useRouter();
  const search = useSearch({ from: '/' }) as DashboardSearch;
  const [open, setOpen] = useState(false);

  const prefersReduced = useReducedMotion();
  const init = prefersReduced ? { opacity: 0 } : MOTION_INIT;
  const anim = prefersReduced ? { opacity: 1 } : MOTION_ANIM;
  const exit = prefersReduced ? { opacity: 0 } : MOTION_EXIT;

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);

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
                  [c.key as Exclude<FilterKey, 'date'>]: undefined,
                }),
              }),
    }));
  }, [router, search]);

  const clearAll = useCallback(() => {
    const platform = search.platform;
    void router.navigate({
      to: '/',
      replace: true,
      search: (): DashboardSearch => (platform ? { platform } : {}),
    });
  }, [router, search.platform]);

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
            <Typography variant="h5" fontWeight="bolder">
              {PAGE_TEXT.DASHBOARD.TITLE}
            </Typography>

            {/* 플랫폼 버튼 */}
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
          {/* 필터 버튼 */}
          <Button
            variant="outlined"
            onClick={openModal}
            sx={{ whiteSpace: 'nowrap', fontWeight: 700 }}
            color="primary"
            startIcon={<TuneIcon fontSize="small" />}
          >
            {PAGE_TEXT.DASHBOARD.BUTTON.FILTER}
            <CartBadge
              badgeContent={chips.length}
              color="primary"
              overlap="circular"
            />
          </Button>

          {/* 캡슐 */}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <AnimatePresence initial={false}>
              {chips.map((c) => (
                <MotionBox
                  key={`${c.key}`}
                  layout
                  initial={init}
                  animate={anim}
                  exit={exit}
                  transition={MOTION_TRANSITION}
                >
                  <Chip
                    label={c.label}
                    onDelete={c.onDelete}
                    variant="outlined"
                    color="primary"
                    sx={{ borderRadius: 999 }}
                  />
                </MotionBox>
              ))}

              {chips.length > 0 && (
                <MotionBox
                  key="__clear-all__"
                  layout
                  initial={init}
                  animate={anim}
                  exit={exit}
                  transition={MOTION_TRANSITION}
                >
                  <Button
                    variant="text"
                    size="small"
                    color="primary"
                    onClick={clearAll}
                    sx={{ textTransform: 'none', fontWeight: 700 }}
                  >
                    {PAGE_TEXT.DASHBOARD.BUTTON.CLEAR_ALL}
                  </Button>
                </MotionBox>
              )}
            </AnimatePresence>
          </Stack>
        </Grid>
      </Grid>

      <FilterModal open={open} onClose={closeModal} />
    </>
  );
};
