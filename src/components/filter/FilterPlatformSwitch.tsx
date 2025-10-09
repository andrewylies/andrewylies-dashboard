import { memo, useCallback, useMemo } from 'react';
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
import { useNavigate, useRouterState } from '@tanstack/react-router';
import type { DashboardSearch } from '@/types';
import * as React from 'react';
import { PAGE_TEXT } from '@/constants';

type Platform = 'web' | 'app' | undefined;
type UIValue = '' | 'web' | 'app';

type Props = {
  isFloating?: boolean;
};

const PlatformQuickSwitchInner = ({ isFloating = false }: Props) => {
  const navigate = useNavigate();

  const platform = useRouterState({
    select: (s) =>
      (s.location.search as Partial<DashboardSearch>)?.platform as Platform,
  });

  const uiValue: UIValue = useMemo(
    () => (platform === 'web' || platform === 'app' ? platform : ''),
    [platform]
  );

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

  const paperSx = useMemo(
    () => ({ opacity: isFloating ? 0.6 : 1 }),
    [isFloating]
  );

  return (
    <Paper elevation={isFloating ? 4 : 0} sx={paperSx}>
      <ToggleButtonGroup
        size="small"
        value={uiValue}
        exclusive
        onChange={handleChange}
        color="primary"
        orientation={isFloating ? 'vertical' : 'horizontal'}
      >
        <Tooltip
          title={PAGE_TEXT.DASHBOARD.PLATFORM.ALL}
          disableHoverListener={isFloating}
        >
          <ToggleButton
            value=""
            sx={{
              border: isFloating ? '' : 'none',
              borderRadius: isFloating ? 'inherit' : '4px!important',
              display: 'flex',
              gap: 0.5,
            }}
            aria-label="All platforms"
          >
            <SegmentIcon />
          </ToggleButton>
        </Tooltip>

        {!isFloating && (
          <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />
        )}

        <Tooltip
          title={PAGE_TEXT.DASHBOARD.PLATFORM.APP}
          disableHoverListener={isFloating}
        >
          <ToggleButton
            value="app"
            sx={{
              border: isFloating ? '' : 'none',
              borderRadius: isFloating ? 'inherit' : '4px!important',
              display: 'flex',
              gap: 0.5,
            }}
            aria-label="App only"
          >
            <PhoneIphoneIcon />
          </ToggleButton>
        </Tooltip>

        {!isFloating && (
          <Divider flexItem orientation="vertical" sx={{ mx: 0.5, my: 1 }} />
        )}

        <Tooltip
          title={PAGE_TEXT.DASHBOARD.PLATFORM.WEB}
          disableHoverListener={isFloating}
        >
          <ToggleButton
            value="web"
            sx={{
              border: isFloating ? '' : 'none',
              borderRadius: isFloating ? 'inherit' : '4px!important',
              display: 'flex',
              gap: 0.5,
            }}
            aria-label="Web only"
          >
            <ComputerIcon />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
    </Paper>
  );
};

export const PlatformQuickSwitch = memo(
  PlatformQuickSwitchInner,
  (prev, next) => prev.isFloating === next.isFloating
);
