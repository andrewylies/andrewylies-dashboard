import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import * as React from 'react';
import { PRESET_RANGES, FILTER_LABELS } from '@/constants';
import type { FilterKey } from '@/types';
import { useFilterModal } from '@/hooks/useFilterModal.ts';

type Props = { open: boolean; onClose: () => void };

const CapsuleSection: React.FC<{
  title: string;
  type: FilterKey;
  isAll: boolean;
  onAll: () => void;
  selected: Set<string>;
  options: { value: string; label: string }[];
  onToggle: (value: string) => void;
}> = ({ title, type, isAll, onAll, selected, options, onToggle }) => {
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

export const FilterModal: React.FC<Props> = ({ open, onClose }) => {
  const {
    // 날짜 상태/오류/프리셋
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

    // 카테고리/토글
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

    // 액션
    handleApply,
    handleCancel,

    // 모달 라이프사이클
    syncOnOpen,
  } = useFilterModal(onClose);

  // open 변경 시 URL → 로컬 동기화
  React.useEffect(() => {
    if (open) syncOnOpen();
  }, [open, syncOnOpen]);

  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="md">
      <DialogTitle>필터</DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* 기간 프리셋 */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              기간
            </Typography>
            <ButtonGroup variant="outlined">
              {PRESET_RANGES.map((p) => (
                <Button
                  key={p.key}
                  onClick={() => handlePreset(p.key)}
                  variant={presetKey === p.key ? 'contained' : 'outlined'}
                >
                  {p.label}
                </Button>
              ))}
            </ButtonGroup>
          </Box>

          {/* 날짜 입력 */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box display="flex" gap={2} alignItems="flex-start" flexWrap="wrap">
              <DatePicker
                label="시작일"
                value={start}
                onChange={handleStartChange}
                slotProps={{
                  textField: {
                    size: 'small',
                    error: Boolean(startErrorMsg),
                    helperText: startErrorMsg,
                  },
                }}
              />
              <DatePicker
                label="종료일"
                value={end}
                onChange={handleEndChange}
                slotProps={{
                  textField: {
                    size: 'small',
                    error: Boolean(endErrorMsg),
                    helperText: endErrorMsg,
                  },
                }}
              />
            </Box>
          </LocalizationProvider>

          {/* 다중 선택 캡슐 섹션들 */}
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
