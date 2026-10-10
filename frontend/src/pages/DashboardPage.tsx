import { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Container, Typography } from '@mui/material';
import { getDashboardRequest, setBudgetRequest } from '../api/dashboard';
import BudgetCard from '../components/BudgetCard';
import CategoryBreakdown from '../components/CategoryBreakdown';
import ExpenseList from '../components/ExpenseList';
import MonthPicker from '../components/MonthPicker';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/useAuth';
import type { DashboardData } from '../types';
import { currentMonth, formatDate, formatMoney } from '../utils/format';

export default function DashboardPage() {
  const { user } = useAuth();
  const [month, setMonth] = useState(currentMonth());
  const [reloadKey, setReloadKey] = useState(0);

  const requestKey = `${month}#${reloadKey}`;
  const [result, setResult] = useState<{ key: string; data: DashboardData | null; error: string | null } | null>(null);

  const loading = result === null || result.key !== requestKey;
  const data = result && result.key === requestKey ? result.data : null;
  const error = result && result.key === requestKey ? result.error : null;

  useEffect(() => {
    let cancelled = false;

    getDashboardRequest(month)
      .then((response) => {
        if (!cancelled) setResult({ key: requestKey, data: response, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setResult({
            key: requestKey,
            data: null,
            error: err instanceof Error ? err.message : 'Could not load the dashboard.',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [month, requestKey]);

  async function handleSaveBudget(amount: number) {
    await setBudgetRequest(month, amount);
    setReloadKey((key) => key + 1);
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1">
            Dashboard
          </Typography>
          <Typography color="text.secondary">Welcome back, {user?.name}.</Typography>
        </Box>
        <MonthPicker value={month} onChange={setMonth} />
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {loading && !error && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {data && (
        <Box sx={{ display: 'grid', gap: 3 }}>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' } }}>
            <StatCard label="Total spent this month" value={formatMoney(data.totalSpent)} />
            <StatCard
              label="Remaining budget"
              value={data.budget.remaining === null ? 'No budget' : formatMoney(data.budget.remaining)}
              hint={data.budget.remaining !== null && data.budget.remaining < 0 ? 'Over budget' : undefined}
            />
            <StatCard
              label="Highest expense"
              value={data.highestExpense ? formatMoney(data.highestExpense.amount) : 'None yet'}
              hint={data.highestExpense ? `${data.highestExpense.title} · ${formatDate(data.highestExpense.date)}` : undefined}
            />
          </Box>

          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
            <BudgetCard key={`${data.budget.month}-${data.budget.amount}`} budget={data.budget} onSave={handleSaveBudget} />
            <CategoryBreakdown items={data.spendingByCategory} />
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              Recent expenses
            </Typography>
            {data.recentExpenses.length === 0 ? (
              <Alert severity="info">No expenses yet. Add one from the Expenses page.</Alert>
            ) : (
              <ExpenseList expenses={data.recentExpenses} />
            )}
          </Box>
        </Box>
      )}
    </Container>
  );
}