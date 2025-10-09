import { Box, Divider, Grid, Typography } from '@mui/material';

export const Footer = () => {
  return (
    <Grid size={{ xs: 12 }}>
      <Box sx={{ mb: 5 }}>
        <Divider />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2 }}>
          <Typography variant={'caption'}>
            2025 📊 Demo dashboard for data visualization · MYEONGSU SEOMUN
          </Typography>
        </Box>
      </Box>
    </Grid>
  );
};
