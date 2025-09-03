import { Grid, Card, CardContent, Skeleton } from '@mui/material';

export const DashboardSkeletons = () => {
  return (
    <Grid container spacing={2}>
      {/* KPI 카드 */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Skeleton variant="rectangular" width="100%" height={80} />
          </CardContent>
        </Card>
      </Grid>

      {/* 라인 차트 */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Skeleton variant="rectangular" width="100%" height={300} />
          </CardContent>
        </Card>
      </Grid>

      {/* 파이 차트 */}
      <Grid size={{ xs: 12, md: 6 }}>
        <Card>
          <CardContent>
            <Skeleton variant="circular" width={200} height={200} />
          </CardContent>
        </Card>
      </Grid>

      {/* 스택 바 차트 */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Skeleton variant="rectangular" width="100%" height={300} />
          </CardContent>
        </Card>
      </Grid>

      {/* 데이터 테이블 */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Skeleton variant="rectangular" width="100%" height={400} />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
