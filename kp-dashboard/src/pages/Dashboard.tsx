import { Grid, Card, CardContent, Typography } from '@mui/material';
import { LineChart } from '@/components/charts/LineChart.tsx';
import { useDashboardData } from '@/hooks/useDashboardData.ts';
import { DashboardFilters } from '@/components/filter/DashboardFilters.tsx';
import { LoadingOverlay } from '@/components/common/LoadingOverlay.tsx';

export const Dashboard = () => {
  const { isLoading, error } = useDashboardData();

  if (isLoading) {
    return (
      <>
        <LoadingOverlay />
      </>
    );
  }

  if (error) return <div>Error!</div>;

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <DashboardFilters />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography>KPI Cards 영역</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography>라인 차트</Typography>
            <div>
              <LineChart data={[150, 230, 224, 218, 135, 147, 260]} />
            </div>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography>파이 차트</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Typography>스택 바 차트</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Typography>데이터 테이블</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
