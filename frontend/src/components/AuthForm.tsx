import { useState } from 'react';
import type { FormEvent } from 'react';
import { Alert, Box, Button, CircularProgress, Paper, TextField, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Link } from '@mui/material';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onSubmit: (values: { name: string; email: string; password: string }) => Promise<void>;
}

export default function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const isSignup = mode === 'signup';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (isSignup && name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({ name, email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', px: 2, py: 6 }}>
      <Paper sx={{ p: { xs: 3, sm: 4 }, width: '100%', maxWidth: 420 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {isSignup ? 'Create your account' : 'Sign in to Retain'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'grid', gap: 2 }}>
          {isSignup && (
            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} required fullWidth />
          )}
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            helperText={isSignup ? 'At least 8 characters' : undefined}
          />
          <Button type="submit" variant="contained" size="large" disabled={submitting}>
            {submitting ? <CircularProgress size={24} /> : isSignup ? 'Sign up' : 'Sign in'}
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 2 }}>
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <Link component={RouterLink} to={isSignup ? '/login' : '/signup'}>
            {isSignup ? 'Sign in' : 'Sign up'}
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}