import { useState } from 'react';
import type { FormEvent } from 'react';
import { Alert, Box, Button, CircularProgress, MenuItem, TextField } from '@mui/material';
import type { Category, Expense, ExpenseInput, PaymentMethod } from '../types';
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '../utils/format';

interface ExpenseFormProps {
  categories: Category[];
  expense?: Expense;
  onSubmit: (input: ExpenseInput) => Promise<void>;
  onCancel: () => void;
}

function today(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export default function ExpenseForm({ categories, expense, onSubmit, onCancel }: ExpenseFormProps) {
  const [title, setTitle] = useState(expense?.title ?? '');
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '');
  const [categoryId, setCategoryId] = useState<number | ''>(expense?.categoryId ?? '');
  const [date, setDate] = useState(expense?.date ?? today());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>(expense?.paymentMethod ?? '');
  const [notes, setNotes] = useState(expense?.notes ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const amountNumber = Number(amount);
    if (title.trim() === '') return setError('Title is required.');
    if (amount.trim() === '' || !Number.isFinite(amountNumber) || amountNumber <= 0) {
      return setError('Amount must be a number greater than 0.');
    }
    if (categoryId === '') return setError('Please choose a category.');
    if (date === '') return setError('Please choose a date.');
    if (paymentMethod === '') return setError('Please choose a payment method.');

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        amount: amountNumber,
        categoryId,
        date,
        paymentMethod,
        notes: notes.trim() === '' ? null : notes.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
      setSubmitting(false);
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'grid', gap: 2, pt: 1 }}>
      {error && <Alert severity="error">{error}</Alert>}

      <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth />
      <TextField
        label="Amount"
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        fullWidth
        slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
      />
      <TextField
        select
        label="Category"
        value={categoryId}
        onChange={(e) => setCategoryId(Number(e.target.value))}
        required
        fullWidth
      >
        {categories.map((category) => (
          <MenuItem key={category.id} value={category.id}>
            {category.name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
        fullWidth
        slotProps={{ inputLabel: { shrink: true } }}
      />
      <TextField
        select
        label="Payment method"
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
        required
        fullWidth
      >
        {PAYMENT_METHODS.map((method) => (
          <MenuItem key={method} value={method}>
            {PAYMENT_METHOD_LABELS[method]}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        multiline
        minRows={2}
        fullWidth
      />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={submitting}>
          {submitting ? <CircularProgress size={22} /> : expense ? 'Save changes' : 'Add expense'}
        </Button>
      </Box>
    </Box>
  );
}