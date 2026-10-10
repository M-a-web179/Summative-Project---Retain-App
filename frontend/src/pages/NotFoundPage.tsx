import { Box, Button, Container, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <Container sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h3" component="h1" gutterBottom>
        404
      </Typography>
      <Typography sx={{ mb: 3 }}>We couldn't find that page.</Typography>
      <Box>
        <Button variant="contained" component={RouterLink} to="/">
          Back to the dashboard
        </Button>
      </Box>
    </Container>
  );
}