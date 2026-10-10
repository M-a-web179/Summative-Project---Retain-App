import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function NavBar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  function handleSignOut() {
    signOut();
    navigate('/login');
  }

  return (
    <AppBar position="static">
      <Toolbar sx={{ flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6" component={RouterLink} to="/" sx={{ color: 'inherit', textDecoration: 'none', mr: 2 }}>
          Retain
        </Typography>
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
          {user && (
            <>
              <Button color="inherit" component={RouterLink} to="/">
                Dashboard
              </Button>
              <Button color="inherit" component={RouterLink} to="/expenses">
                Expenses
              </Button>
            </>
          )}
          {user?.role === 'admin' && (
            <Button color="inherit" component={RouterLink} to="/admin">
              Admin
            </Button>
          )}
        </Box>
        {user ? (
          <Button color="inherit" onClick={handleSignOut}>
            Sign out
          </Button>
        ) : (
          <>
            <Button color="inherit" component={RouterLink} to="/login">
              Sign in
            </Button>
            <Button color="inherit" component={RouterLink} to="/signup">
              Sign up
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}