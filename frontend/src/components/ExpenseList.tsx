import { Box, Card, CardContent, Chip, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import type { Expense } from '../types';
import { PAYMENT_METHOD_LABELS, formatDate, formatMoney } from '../utils/format';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
}

export default function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      {expenses.map((expense) => (
        <Card key={expense.id} variant="outlined">
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {expense.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatDate(expense.date)} · {PAYMENT_METHOD_LABELS[expense.paymentMethod]}
              </Typography>
              <Chip label={expense.categoryName} size="small" sx={{ mt: 0.5 }} />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6">{formatMoney(expense.amount)}</Typography>
              {onEdit && (
                <IconButton aria-label={`Edit ${expense.title}`} onClick={() => onEdit(expense)}>
                  <EditIcon />
                </IconButton>
              )}
              {onDelete && (
                <IconButton aria-label={`Delete ${expense.title}`} onClick={() => onDelete(expense)}>
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}