import { useMemo, useState, useCallback } from 'react';
import { Box, Chip, Stack, Button } from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import { useRouter, useSearch } from '@tanstack/react-router';
import type { DashboardSearch } from '@/types';
import { summarizeCsv, buildDateChip, buildMultiChips } from '@/lib';
import { FilterModal } from '@/components/filter/FilterModal.tsx';

export const FilterSearchBar = () => {
  const router = useRouter();
  const search = useSearch({ from: '/' }) as DashboardSearch;
  const [open, setOpen] = useState(false);

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
                  [c.key]: undefined,
                }),
              }),
    }));
  }, [router, search]);

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
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
        </Stack>

        {/* 우측: 필터 버튼 */}
        <Button
          variant="outlined"
          startIcon={<TuneIcon />}
          onClick={openModal}
          sx={{ whiteSpace: 'nowrap' }}
        >
          필터
        </Button>
      </Box>

      <FilterModal open={open} onClose={closeModal} />
    </>
  );
};
