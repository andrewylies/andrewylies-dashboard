import { Stack, IconButton, Tooltip } from '@mui/material';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { memo } from 'react';
import { CHART_TEXT } from '@/constants';

export type PieMode = 'sales' | 'count';

type Props = {
  mode: PieMode;
  onChange: (mode: PieMode) => void;
  disabled?: Partial<Record<PieMode, boolean>>;
};

export const PieModeToggle = memo(({ mode, onChange, disabled }: Props) => {
  return (
    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
      <Tooltip title={CHART_TEXT.PIE.TOOLTIP.SALES}>
        <span>
          <IconButton
            color={mode === 'sales' ? 'primary' : 'default'}
            onClick={() => onChange('sales')}
            disabled={disabled?.sales}
            size={'small'}
          >
            <MonetizationOnIcon fontSize={'small'} />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title={CHART_TEXT.PIE.TOOLTIP.COUNT}>
        <span>
          <IconButton
            color={mode === 'count' ? 'primary' : 'default'}
            onClick={() => onChange('count')}
            disabled={disabled?.count}
            size={'small'}
          >
            <LibraryBooksIcon fontSize={'small'} />
          </IconButton>
        </span>
      </Tooltip>
    </Stack>
  );
});

PieModeToggle.displayName = 'PieModeToggle';
