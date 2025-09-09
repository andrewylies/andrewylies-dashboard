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
  const { state, errors, flags, actions } = useFilterModal(onClose);

  useEffect(() => {
    if (open) actions.syncOnOpen();
  }, [open, actions]);

  const sections: {
    key: FilterKey;
    title: string;
    options: { value: string; label: string }[];
  }[] = [
    {
      key: 'publisher',
      title: FILTER_LABELS.publisher,
      options: state.options.publisher,
    },
    { key: 'genre', title: FILTER_LABELS.genre, options: state.options.genre },
    {
      key: 'status',
      title: FILTER_LABELS.status,
      options: state.options.status,
    },
    {
      key: 'category',
      title: FILTER_LABELS.category,
      options: state.options.category,
    },
    { key: 'tags', title: FILTER_LABELS.tags, options: state.options.tags },
  ];

  return (
    <Dialog open={open} onClose={actions.cancel} fullWidth maxWidth="md">
      <DialogTitle sx={{ textTransform: 'uppercase' }} fontWeight="bolder">
        {PAGE_TEXT.DASHBOARD.BUTTON.FILTER}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          <DatePresetSection
            currentKey={state.date.presetKey}
            onSelect={actions.preset}
          />
          <DatePickersSection
            start={state.date.start}
            end={state.date.end}
            onStart={actions.setStart}
            onEnd={actions.setEnd}
            startError={errors.start}
            endError={errors.end}
          />
          {sections.map(({ key, title, options }) => (
            <CapsuleSection
              key={key}
              title={title}
              type={key}
              isAll={state.multi[key].isAll}
              onAll={() => actions.selectAll(key)}
              selected={state.multi[key].set}
              options={options}
              onToggle={actions.toggle}
            />
          ))}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={actions.cancel} color="inherit">
          취소
        </Button>
        <Button
          onClick={actions.apply}
          variant="contained"
          disabled={flags.hasDateError || flags.isUnchanged}
        >
          적용
        </Button>
      </DialogActions>
    </Dialog>
  );
};
