import {
  Container,
  CssBaseline,
  Box,
  Typography,
  AppBar,
  Toolbar,
  Menu,
  Tooltip,
  MenuItem,
  Button,
} from '@mui/material';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import { Outlet } from '@tanstack/react-router';
import '@/App.css';
import { useState } from 'react';
import * as React from 'react';

export const Layout = () => {
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const settings = ['Profile', 'Account', 'Dashboard', 'Logout'];

  return (
    <>
      <CssBaseline />
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Typography
              noWrap
              component="a"
              href="/"
              sx={{
                mr: 2,
                display: 'flex',
                flexGrow: 1,
                fontFamily: 'monospace',
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
                alignItems: 'anchor-center',
              }}
            >
              <InsertChartOutlinedIcon sx={{ display: 'flex', mr: 1 }} />
              Webtoon KPI
            </Typography>

            {/* 사용자 메뉴 */}
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <Button onClick={handleOpenUserMenu} color="inherit">
                  서문명수
                </Button>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                anchorEl={anchorElUser}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                {settings.map((setting) => (
                  <MenuItem key={setting} onClick={handleCloseUserMenu}>
                    <Typography textAlign="center">{setting}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* 컨텐츠 영역 */}
      <Container maxWidth="xl" sx={{ mt: 4, height: '100%' }}>
        <Outlet />
      </Container>
    </>
  );
};
