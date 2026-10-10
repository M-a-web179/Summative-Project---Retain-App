import { Container, Typography } from '@mui/material';
import { useAuth } from '../context/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography>
        Signed in as {user?.name} ({user?.role}). The real dashboard comes later.
      </Typography>
    </Container>
  );
}