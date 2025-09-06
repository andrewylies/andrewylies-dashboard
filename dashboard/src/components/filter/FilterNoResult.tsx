import { Box, Container, Typography } from '@mui/material';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { ERROR_CODES } from '@/constants';
import { memo } from 'react';

const LOTTIE_SRC =
  'https://lottie.host/b6f121b1-6bb3-4cd4-8959-97e29f486682/3A0trYswEa.lottie';

const StaticLottie = memo(() => (
  <DotLottieReact src={LOTTIE_SRC} loop autoplay />
));
StaticLottie.displayName = 'StaticLottie';

export const FilterNoResult = memo(() => {
  return (
    <Container
      maxWidth="sm"
      sx={{
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        display: 'flex',
        minHeight: '60vh',
        mt: 10,
      }}
    >
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <StaticLottie />
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            {ERROR_CODES.NO_SALES.title}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            {ERROR_CODES.NO_SALES.message}
          </Typography>
        </Box>
      </Box>
    </Container>
  );
});
FilterNoResult.displayName = 'FilterNoResult';
