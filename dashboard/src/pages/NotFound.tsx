import type { NotFoundRouteProps } from '@tanstack/react-router';
import { ERROR_CODES } from '@/constants';
import { Box, Button, Container, Typography } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export function NotFound({ data }: NotFoundRouteProps) {
  const error = data as { title?: string; message?: string } | undefined;

  return (
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        height: '95dvh',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <img
          src="https://i.postimg.cc/2yrFyxKv/giphy.gif"
          alt="error-gif"
          style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
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
    </Container>
  );
}
