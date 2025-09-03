import { Box, Chip, Button, Menu, MenuItem, IconButton } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useRouter, useSearch } from '@tanstack/react-router';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useCallback, useMemo } from 'react';

import type { DashboardSearch, FilterKey } from '@/types/filter';
import { useFilterStore } from '@/stores/filterStore';
import { FilterInput } from '@/components/input/FilterInput.tsx';
import { FILTER_KEYS, FILTER_LABELS } from '@/constants/filter.ts';

export const DashboardFilters = () => {
  const search = useSearch({ from: '/' }) as DashboardSearch;
  const router = useRouter();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeFilters, setActiveFilters] = useState<FilterKey[]>([]);

  const filterOptions = useFilterStore((s) => s.options);

  const updateSearch = useCallback(
    (patch: Partial<DashboardSearch>) => {
      void router.navigate({
        to: '/',
        search: (prev: DashboardSearch) => ({ ...prev, ...patch }),
      });
    },
    [router]
  );

  const handleMenuOpen = useCallback((e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  }, []);
  const handleMenuClose = useCallback(() => setAnchorEl(null), []);

  const handleAddFilter = useCallback((key: FilterKey) => {
    setActiveFilters((prev) => (prev.includes(key) ? prev : [...prev, key]));
    setAnchorEl(null);
  }, []);

  const handleRemove = useCallback(
    (key: FilterKey) => {
      setActiveFilters((prev) => prev.filter((f) => f !== key));
      updateSearch({ [key]: 'all' } as Partial<DashboardSearch>);
    },
    [updateSearch]
  );

  const makeOnChange = useCallback(
    (key: FilterKey) => (val: string) => {
      updateSearch({ [key]: val } as Partial<DashboardSearch>);
    },
    [updateSearch]
  );

  const availableFilters = useMemo<FilterKey[]>(
    () => FILTER_KEYS.filter((f) => !activeFilters.includes(f)),
    [activeFilters]
  );

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {/* 날짜 필터 */}
      <Box display="flex" gap={2} alignItems="center">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          {(['start', 'end'] as const).map((field) => (
            <Box key={field} display="flex" alignItems="center" gap={1}>
              <DatePicker
                label={field === 'start' ? '시작일' : '종료일'}
                value={search[field] ? dayjs(search[field]) : null}
                onChange={(d: Dayjs | null) =>
                  updateSearch({
                    [field]: d ? d.format('YYYY-MM-DD') : undefined,
                  } as Partial<DashboardSearch>)
                }
                slotProps={{ textField: { size: 'small' } }}
              />
              {search[field] && (
                <IconButton
                  size="small"
                  onClick={() => updateSearch({ [field]: undefined })}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          ))}
        </LocalizationProvider>
      </Box>

      {/* Chip + 동적 필터 */}
      <Box display="flex" gap={1} flexWrap="wrap" alignItems="center">
        {activeFilters.map((f) => (
          <Chip
            key={f}
            label={FILTER_LABELS[f]}
            onDelete={() => handleRemove(f)}
            color="primary"
            variant="outlined"
          />
        ))}

        {activeFilters.map((f) => {
          const onChange = makeOnChange(f);
          const optionsForF = filterOptions[f];
          return (
            <FilterInput
              key={f}
              type={f}
              value={search[f]}
              options={optionsForF}
              onChange={onChange}
            />
          );
        })}

        <Button variant="outlined" size="small" onClick={handleMenuOpen}>
          + Filter
        </Button>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          {availableFilters.map((f) => (
            <MenuItem key={f} onClick={() => handleAddFilter(f)}>
              {FILTER_LABELS[f]}
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </Box>
  );
};
