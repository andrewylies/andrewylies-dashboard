import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from '@mui/material';
import { FILTER_LABELS, PAGE_TEXT } from '@/constants';
import { useFilterModal } from '@/hooks/useFilterModal.ts';
import { DatePresetSection } from '@/components/filter/section/DatePresetSection';
import { DatePickersSection } from '@/components/filter/section/DatePickersSection';
import { CapsuleSection } from '@/components/filter/section/CapsuleSection.tsx';
import { useEffect, useMemo } from 'react';

type Props = { open: boolean; onClose: () => void };

export const FilterModal = ({ open, onClose }: Props) => {
  const { state, errors, flags, actions } = useFilterModal(onClose);
  const {
    syncOnOpen,
    selectAll,
    toggle,
    preset,
    setStart,
    setEnd,
    apply,
    cancel,
  } = actions;

  useEffect(() => {
    if (open) syncOnOpen();
  }, [open, syncOnOpen]);

  const sections = useMemo(
    () =>
      [
        {
          key: 'publisher',
          title: FILTER_LABELS.publisher,
          options: state.options.publisher,
        },
        {
          key: 'genre',
          title: FILTER_LABELS.genre,
          options: state.options.genre,
        },
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
      ] as const,
    [state.options]
  );

  return (
    <Dialog open={open} onClose={cancel} fullWidth maxWidth="md">
      <DialogTitle sx={{ textTransform: 'uppercase' }} fontWeight="bolder">
        {PAGE_TEXT.DASHBOARD.BUTTON.FILTER}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          <DatePresetSection
            currentKey={state.date.presetKey}
            onSelect={preset}
          />
          <DatePickersSection
            start={state.date.start}
            end={state.date.end}
            onStart={setStart}
            onEnd={setEnd}
            startError={errors.start}
            endError={errors.end}
          />
          {sections.map(({ key, title, options }) => (
            <CapsuleSection
              key={key}
              title={title}
              type={key}
              isAll={state.multi[key].isAll}
              onAll={selectAll}
              selected={state.multi[key].set}
              options={options}
              onToggle={toggle}
            />
          ))}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={cancel} color="inherit">
          {PAGE_TEXT.CANCEL}
        </Button>
        <Button
          onClick={apply}
          variant="contained"
          disabled={flags.hasDateError || flags.isUnchanged}
        >
          {PAGE_TEXT.APPLY}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
