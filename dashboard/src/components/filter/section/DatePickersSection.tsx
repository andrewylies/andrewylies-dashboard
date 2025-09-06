import { Box, Typography } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { Dayjs } from 'dayjs';
import { PAGE_TEXT } from '@/constants';

type Props = {
  start: Dayjs | null;
  end: Dayjs | null;
  onStart: (d: Dayjs | null) => void;
  onEnd: (d: Dayjs | null) => void;
  startError?: string;
  endError?: string;
  previewText?: string;
};

export const DatePickersSection = ({
  start,
  end,
  onStart,
  onEnd,
  startError,
  endError,
  previewText,
}: Props) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box display="flex" gap={2} alignItems="flex-start" flexWrap="wrap">
        <DatePicker
          label={PAGE_TEXT.DASHBOARD.FILTER.PERIOD.START_DATE}
          value={start}
          onChange={onStart}
          slotProps={{
            textField: {
              size: 'small',
              error: Boolean(startError),
              helperText: startError,
            },
          }}
        />
        <DatePicker
          label={PAGE_TEXT.DASHBOARD.FILTER.PERIOD.END_DATE}
          value={end}
          onChange={onEnd}
          slotProps={{
            textField: {
              size: 'small',
              error: Boolean(endError),
              helperText: endError,
            },
          }}
        />
        {previewText ? (
          <Typography
            sx={{ color: 'text.secondary', whiteSpace: 'nowrap', mt: 1 }}
          >
            {previewText}
          </Typography>
        ) : null}
      </Box>
    </LocalizationProvider>
  );
};
