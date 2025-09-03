import { Backdrop, CircularProgress, Box, Typography } from '@mui/material';

export const LoadingOverlay = () => {
  return (
    <Backdrop
      open
      sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
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
        <Typography sx={{ mt: 2, color: 'white' }}>
          데이터 불러오는 중...
        </Typography>
      </Box>
    </Backdrop>
  );
};
