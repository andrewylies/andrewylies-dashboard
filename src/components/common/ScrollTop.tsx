import { Box, Fade, useScrollTrigger } from '@mui/material';
import { type ReactElement } from 'react';

interface Props {
  window?: () => Window;
  children?: ReactElement;
}

export const ScrollTop = ({ children, window }: Props) => {
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
    disableHysteresis: true,
    threshold: 100,
  });

  return (
    <Fade in={trigger}>
      <Box
        role="presentation"
        sx={{
          position: 'fixed',
          bottom: { xs: 15, md: 30 },
          right: { xs: 15, md: 30 },
        }}
      >
        {children}
      </Box>
    </Fade>
  );
};
