import type { NotFoundRouteProps } from '@tanstack/react-router';
import { ERROR_CODES } from '@/constants';
import { Box, Button, Container, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import type { ErrorProps } from '@/types';
import Lottie from 'lottie-react';
import failJson from '@/assets/lottie/fail.json';

export function NotFound({ data }: NotFoundRouteProps) {
  const error = data as ErrorProps;
  return (
    <Container
      maxWidth="sm"
      sx={{
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        minHeight: '80vh',
        display: 'flex',
        padding: 5,
      }}
    >
      <Box>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', height: '276px' }}
        >
          <Lottie animationData={failJson} autoplay loop={false} />
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            {error?.title ? error.title : ERROR_CODES.NOT_FOUND.TITLE}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            {error?.message ?? ERROR_CODES.NOT_FOUND.MESSAGE}
          </Typography>

          <Button
            variant="contained"
            size="medium"
            endIcon={<ArrowForwardIcon />}
            href="/"
          >
            Back to Home
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
