import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import * as React from 'react';
import { FILTER_LABELS } from '@/constants';
import type { FilterKey } from '@/types';
import { useFilterModal } from '@/hooks/useFilterModal.ts';

import { DatePresetSection } from '@/components/filter/DatePresetSection';
import { DatePickersSection } from '@/components/filter/DatePickersSection';

type ModalProps = { open: boolean; onClose: () => void };

type CapsuleSectionProps = {
  title: string;
  type: FilterKey;
  isAll: boolean;
  onAll: () => void;
  selected: Set<string>;
  options: { value: string; label: string }[];
  onToggle: (value: string) => void;
};

const CapsuleSection = ({
  title,
  type,
  isAll,
  onAll,
  selected,
  options,
  onToggle,
}: CapsuleSectionProps) => {
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
          onClick={onAll}
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
              onClick={() => onToggle(opt.value)}
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

export const FilterModal = ({ open, onClose }: ModalProps) => {
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
    pubState,
    genState,
    staState,
    catState,
    tagState,
    clickAllPublisher,
    clickAllGenre,
    clickAllStatus,
    clickAllCategory,
    clickAllTags,
    togglePublisher,
    toggleGenre,
    toggleStatus,
    toggleCategory,
    toggleTags,
    handleApply,
    handleCancel,
    syncOnOpen,
  } = useFilterModal(onClose);

  React.useEffect(() => {
    if (open) syncOnOpen();
  }, [open, syncOnOpen]);

  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="md">
      <DialogTitle>필터</DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          {/* 기간 프리셋 */}
          <DatePresetSection currentKey={presetKey} onSelect={handlePreset} />

          {/* 날짜 선택 */}
          <DatePickersSection
            start={start}
            end={end}
            onStart={handleStartChange}
            onEnd={handleEndChange}
            startError={startErrorMsg}
            endError={endErrorMsg}
          />

          {/* 다중 선택 캡슐 */}
          <CapsuleSection
            title={FILTER_LABELS.publisher}
            type="publisher"
            isAll={pubState.isAll}
            onAll={clickAllPublisher}
            selected={pubState.set}
            options={options.publisher}
            onToggle={togglePublisher}
          />
          <CapsuleSection
            title={FILTER_LABELS.genre}
            type="genre"
            isAll={genState.isAll}
            onAll={clickAllGenre}
            selected={genState.set}
            options={options.genre}
            onToggle={toggleGenre}
          />
          <CapsuleSection
            title={FILTER_LABELS.status}
            type="status"
            isAll={staState.isAll}
            onAll={clickAllStatus}
            selected={staState.set}
            options={options.status}
            onToggle={toggleStatus}
          />
          <CapsuleSection
            title={FILTER_LABELS.category}
            type="category"
            isAll={catState.isAll}
            onAll={clickAllCategory}
            selected={catState.set}
            options={options.category}
            onToggle={toggleCategory}
          />
          <CapsuleSection
            title={FILTER_LABELS.tags}
            type="tags"
            isAll={tagState.isAll}
            onAll={clickAllTags}
            selected={tagState.set}
            options={options.tags}
            onToggle={toggleTags}
          />
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
