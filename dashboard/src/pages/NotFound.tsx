import type { NotFoundRouteProps } from '@tanstack/react-router';
import { ERROR_CODES } from '@/constants';
import { Box, Button, Container, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import type { ErrorProps } from '@/types';

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
        minHeight: '90vh',
        display: 'flex',
        padding: 5,
      }}
    >
      <Box>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', height: '276px' }}
        >
          <DotLottieReact
            src="https://lottie.host/648f0176-f3f9-4518-8cb3-e92ee7f2ce06/kyXdc7UwDv.lottie"
            autoplay
          />
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h3" fontWeight={700} gutterBottom>
            {error?.title ? error.title : ERROR_CODES.NOT_FOUND.title}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            {error?.message ?? ERROR_CODES.NOT_FOUND.message}
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
