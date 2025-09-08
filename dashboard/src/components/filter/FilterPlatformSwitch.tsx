import { memo, useCallback } from 'react';
import {
  Divider,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import SegmentIcon from '@mui/icons-material/Segment';
import { useNavigate, useSearch } from '@tanstack/react-router';
import type { DashboardSearch } from '@/types';
import * as React from 'react';
import { PAGE_TEXT } from '@/constants';

type Platform = 'web' | 'app' | undefined;
type UIValue = '' | 'web' | 'app';

export const PlatformQuickSwitch = memo(() => {
  const navigate = useNavigate();
  const search = useSearch({ from: '/' });

  const platform: Platform =
    search.platform === 'web' || search.platform === 'app'
      ? search.platform
      : undefined;
  const uiValue: UIValue = platform ?? '';

  const handleChange = useCallback(
    (_e: React.MouseEvent<HTMLElement>, next: UIValue | null) => {
      const nextUi: UIValue = next ?? '';

      void navigate({
        from: '/',
        replace: true,
        search: (prev: DashboardSearch): DashboardSearch => {
          if (nextUi === '') {
            const rest: DashboardSearch = { ...prev };
            delete rest.platform;
            return rest;
          }
          return { ...prev, platform: nextUi };
        },
      });
    },
    [navigate]
  );

  return (
    <Paper elevation={0}>
      <ToggleButtonGroup
        size="small"
        value={uiValue}
        exclusive
        onChange={handleChange}
        color={'primary'}
      >
        <Tooltip title={PAGE_TEXT.DASHBOARD.PLATFORM.ALL}>
          <ToggleButton
            value=""
            sx={{
              border: 'none',
              borderRadius: '4px!important',
              display: 'flex',
              gap: 0.5,
            }}
          >
            <SegmentIcon fontSize="small" />
          </ToggleButton>
        </Tooltip>
        <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />
        <Tooltip title={PAGE_TEXT.DASHBOARD.PLATFORM.APP}>
          <ToggleButton
            value="app"
            sx={{
              border: 'none',
              borderRadius: '4px!important',
              display: 'flex',
              gap: 0.5,
            }}
          >
            <PhoneIphoneIcon fontSize="small" />
          </ToggleButton>
        </Tooltip>
        <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />
        <Tooltip title={PAGE_TEXT.DASHBOARD.PLATFORM.WEB}>
          <ToggleButton
            value="web"
            sx={{
              border: 'none',
              borderRadius: '4px!important',
              display: 'flex',
              gap: 0.5,
            }}
          >
            <ComputerIcon fontSize="small" />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
    </Paper>
  );
});
