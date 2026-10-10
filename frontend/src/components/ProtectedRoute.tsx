import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../context/useAuth';

export default function ProtectedRoute() {
  const { user, isLoading } = useAuth();


  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}