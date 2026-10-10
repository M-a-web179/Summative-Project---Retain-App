import { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Container, Tab, Tabs, Typography } from '@mui/material';
import { getInsightsRequest } from '../api/admin';
import CategoryManager from '../components/CategoryManager';
import InsightsPanel from '../components/InsightsPanel';
import type { AdminInsights } from '../types';

function InsightsTab() {
  const [result, setResult] = useState<{ data: AdminInsights | null; error: string | null } | null>(null);

  useEffect(() => {
    let cancelled = false;

    getInsightsRequest()
      .then((data) => {
        if (!cancelled) setResult({ data, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setResult({ data: null, error: err instanceof Error ? err.message : 'Could not load insights.' });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (result === null) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (result.error) return <Alert severity="error">{result.error}</Alert>;
  return result.data ? <InsightsPanel insights={result.data} /> : null;
}

export default function AdminPage() {
  const [tab, setTab] = useState<'insights' | 'categories'>('insights');

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin dashboard
      </Typography>

      <Tabs value={tab} onChange={(_, value: 'insights' | 'categories') => setTab(value)} sx={{ mb: 3 }}>
        <Tab label="Insights" value="insights" />
        <Tab label="Categories" value="categories" />
      </Tabs>

      {tab === 'insights' ? <InsightsTab /> : <CategoryManager />}
    </Container>
  );
}