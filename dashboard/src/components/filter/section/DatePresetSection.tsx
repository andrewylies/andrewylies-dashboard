import { Box, Button, ButtonGroup, Typography } from '@mui/material';
import { PRESET_RANGES } from '@/constants';

type Props = { currentKey: string | null; onSelect: (key: string) => void };

export const DatePresetSection = ({ currentKey, onSelect }: Props) => {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        기간
      </Typography>
      <ButtonGroup variant="outlined">
        {PRESET_RANGES.map((p) => (
          <Button
            key={p.key}
            onClick={() => onSelect(p.key)}
            variant={currentKey === p.key ? 'contained' : 'outlined'}
          >
            {p.label}
          </Button>
        ))}
      </ButtonGroup>
    </Box>
  );
};
