import { Box, Container, Typography } from '@mui/material';
import Lottie from 'lottie-react';
import { ERROR_CODES } from '@/constants';
import { memo } from 'react';
import noResultJson from '@/assets/lottie/noresult.json';

const StaticLottie = memo(() => (
  <Lottie animationData={noResultJson} loop autoplay />
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
        mt: 10,
        mb: 10,
      }}
    >
      <Box>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', height: '275.41px' }}
        >
          <StaticLottie />
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            {ERROR_CODES.NO_SALES.TITLE}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            {ERROR_CODES.NO_SALES.MESSAGE}
          </Typography>
        </Box>
      </Box>
    </Container>
  );
});
FilterNoResult.displayName = 'FilterNoResult';
