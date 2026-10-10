import { useState } from 'react';
import type { FormEvent } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, LinearProgress, TextField, Typography } from '@mui/material';
import type { BudgetStatus, BudgetSummary } from '../types';
import { formatMoney, formatMonth } from '../utils/format';

interface BudgetCardProps {
  budget: BudgetSummary;
  onSave: (amount: number) => Promise<void>;
}

const STATUS_DISPLAY: Record<BudgetStatus, { label: string; color: 'default' | 'success' | 'warning' | 'error' }> = {
  none: { label: 'No budget set', color: 'default' },
  within: { label: 'Within budget', color: 'success' },
  approaching: { label: 'Approaching budget', color: 'warning' },
  over: { label: 'Over budget', color: 'error' },
};

export default function BudgetCard({ budget, onSave }: BudgetCardProps) {
  const [amount, setAmount] = useState(budget.amount === null ? '' : String(budget.amount));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const status = STATUS_DISPLAY[budget.status];
  const percent = budget.amount && budget.amount > 0 ? Math.min(100, (budget.spent / budget.amount) * 100) : 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const value = Number(amount);
    if (amount.trim() === '' || !Number.isFinite(value) || value < 0) {
      setError('Enter a budget of 0 or more.');
      return;
    }

    setSaving(true);
    try {
      await onSave(value);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the budget.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card variant="outlined">
      <CardContent sx={{ display: 'grid', gap: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="h6">Budget for {formatMonth(budget.month)}</Typography>
          <Chip label={status.label} color={status.color} />
        </Box>

        {budget.amount !== null && (
          <>
            <LinearProgress
              variant="determinate"
              value={percent}
              color={status.color === 'default' ? 'primary' : status.color}
              sx={{ height: 10, borderRadius: 5 }}
            />
            <Typography variant="body2" color="text.secondary">
              {formatMoney(budget.spent)} spent of {formatMoney(budget.amount)}
              {budget.remaining !== null &&
                (budget.remaining >= 0
                  ? ` · ${formatMoney(budget.remaining)} remaining`
                  : ` · ${formatMoney(Math.abs(budget.remaining))} over`)}
            </Typography>
          </>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <TextField
            label="Monthly budget"
            type="number"
            size="small"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
            sx={{ flexGrow: 1, minWidth: 160 }}
          />
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? <CircularProgress size={22} /> : budget.amount === null ? 'Set budget' : 'Update budget'}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}