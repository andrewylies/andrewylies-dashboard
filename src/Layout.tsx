import {
  Container,
  CssBaseline,
  Box,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Popover,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import { Outlet } from '@tanstack/react-router';
import { type ReactElement, useCallback, useMemo, useState } from 'react';
import GitHubIcon from '@mui/icons-material/GitHub';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import * as React from 'react';
import { MENU_PROFILE } from '@/constants';
import { FilterInitializer } from '@/components/filter/FilterInitializer.tsx';
import type { ProfileKey } from '@/types';
import { Footer } from '@/components/common/Footer.tsx';
import { ScrollTop } from '@/components/common/ScrollTop.tsx';
import { PlatformQuickSwitch } from '@/components/filter/FilterPlatformSwitch.tsx';

export const Layout = () => {
  const theme = createTheme({
    colorSchemes: {
      dark: true,
    },
  });

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const openPopover = useCallback((el: HTMLElement) => {
    setAnchorEl(el);
  }, []);

  const closePopover = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleEnter = useCallback(
    (e: React.MouseEvent<HTMLElement>) => openPopover(e.currentTarget),
    [openPopover]
  );

  const handleLeave = useCallback(() => {
    closePopover();
  }, [closePopover]);

  const iconMap: Record<ProfileKey, ReactElement> = useMemo(
    () => ({
      github: <GitHubIcon fontSize="small" />,
      portfolio: <FolderSharedIcon fontSize="small" />,
      linkedin: <LinkedInIcon fontSize="small" />,
    }),
    []
  );

  return (
    <ThemeProvider theme={theme} defaultMode="system">
      <CssBaseline />
      <AppBar position="fixed">
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{ display: 'flex', justifyContent: 'space-between' }}
          >
            <Typography
              noWrap
              component="a"
              href="/"
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                fontFamily: 'monospace',
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
                height: 35,
                textTransform: 'uppercase',
              }}
            >
              Sales Dashboard
            </Typography>

            <Box
              sx={{ flexGrow: 0, position: 'relative' }}
              onMouseEnter={handleEnter}
              onMouseLeave={handleLeave}
            >
              {/* <Button
                color="inherit"
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onMouseEnter={handleEnter}
                onClick={(e) =>
                  open ? setAnchorEl(null) : setAnchorEl(e.currentTarget)
                }
                startIcon={<AccountCircleIcon fontSize="small" />}
              >
                서문명수
              </Button>

              <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{
                  paper: {
                    onMouseEnter: () => anchorEl && openPopover(anchorEl),
                    onMouseLeave: handleLeave,
                  },
                }}
                disableRestoreFocus
              >
                <List dense>
                  {MENU_PROFILE.map((item) => (
                    <ListItemButton
                      key={item.key}
                      component="a"
                      href={item.url}
                      target="_blank"
                      onClick={handleLeave}
                    >
                      <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
                        {iconMap[item.key]}
                      </ListItemIcon>
                      <ListItemText primary={item.label} />
                    </ListItemButton>
                  ))}
                </List>
              </Popover> */}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Toolbar />
      <Container maxWidth="xl" sx={{ height: '100%' }}>
        <FilterInitializer />
        <Outlet />
        <Footer />
      </Container>
      <ScrollTop>
        <PlatformQuickSwitch isFloating />
      </ScrollTop>
    </ThemeProvider>
  );
};
