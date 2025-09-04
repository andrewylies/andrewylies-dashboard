import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import type { FilterInputProps } from '@/types/filter';
import { memo } from 'react';
import { LABEL_MAP } from '@/constants/filter.ts';

export const FilterInput = memo(function FilterInput({
  type,
  value,
  options,
  onChange,
}: FilterInputProps) {
  return (
    <FormControl size="small" sx={{ minWidth: 150 }}>
      <InputLabel>{LABEL_MAP[type]}</InputLabel>
      <Select
        value={value}
        label={LABEL_MAP[type]}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
});
