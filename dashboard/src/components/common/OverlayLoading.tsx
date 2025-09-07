import { Backdrop, CircularProgress, Box, Typography } from '@mui/material';
import { PAGE_TEXT } from '@/constants';

export const OverlayLoading = () => {
  return (
    <Backdrop
      open
      sx={(theme) => ({
        color: theme.palette.primary.main,
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
      })}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        <CircularProgress size={60} color="inherit" />
        <Typography sx={{ mt: 2, color: 'inherit' }}>
          {PAGE_TEXT.LOADING}
        </Typography>
      </Box>
    </Backdrop>
  );
};
