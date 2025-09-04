// src/components/filter/sections/MultiFilterSection.tsx
import { Box, Chip, Stack, Typography } from '@mui/material';
import type { FilterKey } from '@/types';

type MultiState = { isAll: boolean; set: Set<string> };

type Props = {
  title: string;
  type: FilterKey;
  state: MultiState;
  setState: (s: MultiState) => void;
  universe: Set<string>;
  options: { value: string; label: string }[];
  clickAll: () => MultiState;
  toggleValue: (st: MultiState, v: string, all: Set<string>) => MultiState;
};

export const MultiFilterSection = ({
  title,
  type,
  state,
  setState,
  universe,
  options,
  clickAll,
  toggleValue,
}: Props) => {
  const opts = options.filter((o) => o.value !== 'all');

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Chip
          label="전체"
          clickable
          onClick={() => setState(clickAll())}
          color={state.isAll ? 'primary' : 'default'}
          variant={state.isAll ? 'filled' : 'outlined'}
          sx={{ borderRadius: 999 }}
        />
        {opts.map((opt) => {
          const on = !state.isAll && state.set.has(opt.value);
          return (
            <Chip
              key={`${type}:${opt.value}`}
              label={opt.label}
              clickable
              onClick={() => setState(toggleValue(state, opt.value, universe))}
              color={on ? 'primary' : 'default'}
              variant={on ? 'filled' : 'outlined'}
              sx={{ borderRadius: 999 }}
            />
          );
        })}
      </Stack>
    </Box>
  );
};
