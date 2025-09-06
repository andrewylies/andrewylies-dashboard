import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import { FILTER_LABELS, PAGE_TEXT } from '@/constants';
import type { FilterKey } from '@/types';
import { useFilterModal } from '@/hooks/useFilterModal.ts';
import { DatePresetSection } from '@/components/filter/section/DatePresetSection';
import { DatePickersSection } from '@/components/filter/section/DatePickersSection';
import { CapsuleSection } from '@/components/filter/section/CapsuleSection.tsx';
import { useEffect } from 'react';

type Props = { open: boolean; onClose: () => void };
export const FilterModal = ({ open, onClose }: Props) => {
  const {
    start,
    end,
    presetKey,
    startErrorMsg,
    endErrorMsg,
    hasDateError,
    isUnchanged,
    handlePreset,
    handleStartChange,
    handleEndChange,
    options,
    multi,
    toggleValue,
    clickAll,
    handleApply,
    handleCancel,
    syncOnOpen,
  } = useFilterModal(onClose);

  useEffect(() => {
    if (open) syncOnOpen();
  }, [open, syncOnOpen]);

  const sections: {
    key: FilterKey;
    title: string;
    options: { value: string; label: string }[];
  }[] = [
    {
      key: 'publisher',
      title: FILTER_LABELS.publisher,
      options: options.publisher,
    },
    { key: 'genre', title: FILTER_LABELS.genre, options: options.genre },
    { key: 'status', title: FILTER_LABELS.status, options: options.status },
    {
      key: 'category',
      title: FILTER_LABELS.category,
      options: options.category,
    },
    { key: 'tags', title: FILTER_LABELS.tags, options: options.tags },
  ];

  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="md">
      <DialogTitle sx={{ textTransform: 'uppercase' }} fontWeight={'bolder'}>
        {PAGE_TEXT.DASHBOARD.BUTTON.FILTER}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          <DatePresetSection currentKey={presetKey} onSelect={handlePreset} />
          <DatePickersSection
            start={start}
            end={end}
            onStart={handleStartChange}
            onEnd={handleEndChange}
            startError={startErrorMsg}
            endError={endErrorMsg}
          />
          {sections.map(({ key, title, options }) => (
            <CapsuleSection
              key={key}
              title={title}
              type={key}
              isAll={multi[key].isAll}
              onAll={() => clickAll(key)}
              selected={multi[key].set}
              options={options}
              onToggle={toggleValue}
            />
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} color="inherit">
          취소
        </Button>
        <Button
          onClick={handleApply}
          variant="contained"
          disabled={hasDateError || isUnchanged}
        >
          적용
        </Button>
      </DialogActions>
    </Dialog>
  );
};
