import { Container, Typography } from '@mui/material';

export default function AdminPage() {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin dashboard
      </Typography>
      <Typography>Only admins can see this page. The real admin tools come later.</Typography>
    </Container>
  );
}