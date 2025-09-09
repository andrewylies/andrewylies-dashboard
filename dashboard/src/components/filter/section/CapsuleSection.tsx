import type { FilterKey } from '@/types';
import { Chip, Stack, Typography } from '@mui/material';
import { ALL } from '@/constants';

type Props = {
  title: string;
  type: FilterKey;
  isAll: boolean;
  onAll: (key: FilterKey) => void;
  selected: Set<string>;
  options: { value: string; label: string }[];
  onToggle: (key: FilterKey, value: string) => void;
};

export const CapsuleSection = ({
  title,
  type,
  isAll,
  onAll,
  selected,
  options,
  onToggle,
}: Props) => {
  const opts = options.filter((o) => o.value !== 'all');
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" fontWeight="bold">
        {title} <Typography variant={'caption'}>{opts.length}</Typography>
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Chip
          label={ALL.label}
          clickable
          onClick={() => onAll(type)}
          color={isAll ? 'primary' : 'default'}
          variant={isAll ? 'filled' : 'outlined'}
          sx={{ borderRadius: 999 }}
        />
        {opts.map((opt) => {
          const on = !isAll && selected.has(opt.value);
          return (
            <Chip
              key={`${type}-${opt.value}`}
              label={opt.label}
              clickable
              onClick={() => onToggle(type, opt.value)}
              color={on ? 'primary' : 'default'}
              variant={on ? 'filled' : 'outlined'}
              sx={{ borderRadius: 999 }}
            />
          );
        })}
      </Stack>
    </Stack>
  );
};
