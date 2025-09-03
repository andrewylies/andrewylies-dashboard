import { Container, CssBaseline, Box, Typography } from '@mui/material';
import DashboardPage from './pages/Home.tsx';

export default function App() {
  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          p: 2,
          bgcolor: 'primary.main',
          color: 'white',
        }}
      >
        <Typography variant="h6">웹툰 매출 대시보드</Typography>
        <Typography variant="body1">서문명수</Typography>
      </Box>
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <DashboardPage />
      </Container>
    </>
  );
}
