import { Box, Chip, Typography } from '@mui/material';
import type { Expense } from '../types';
import { PAYMENT_METHOD_LABELS, formatDate, formatMoney } from '../utils/format';

export default function ExpenseDetail({ expense }: { expense: Expense }) {
  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      <Typography variant="h5">{formatMoney(expense.amount)}</Typography>
      <Box>
        <Chip label={expense.categoryName} size="small" />
      </Box>
      <Typography>
        <strong>Date:</strong> {formatDate(expense.date)}
      </Typography>
      <Typography>
        <strong>Payment method:</strong> {PAYMENT_METHOD_LABELS[expense.paymentMethod]}
      </Typography>
      <Typography>
        <strong>Notes:</strong> {expense.notes ?? 'No notes'}
      </Typography>
    </Box>
  );
}