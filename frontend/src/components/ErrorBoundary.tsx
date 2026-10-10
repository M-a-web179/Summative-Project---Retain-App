import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Container } from '@mui/material';

interface ErrorBoundaryState {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container sx={{ py: 6 }}>
          <Alert severity="error" action={<Button onClick={() => window.location.assign('/')}>Reload</Button>}>
            Something went wrong. Please reload the page.
          </Alert>
        </Container>
      );
    }
    return this.props.children;
  }
}