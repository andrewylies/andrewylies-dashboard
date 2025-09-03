import { Grid, Card, CardContent, Typography } from '@mui/material';

export default function Home() {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Typography>KPI Cards 영역</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Typography>라인 차트</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent>
            <Typography>파이 차트</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12 }}>
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
}
