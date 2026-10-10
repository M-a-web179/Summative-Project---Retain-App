import { useEffect, useState } from 'react';
import { Alert, Box, CircularProgress, Container, Pagination, Typography } from '@mui/material';
import ExpenseFilters from '../components/ExpenseFilters';
import ExpenseList from '../components/ExpenseList';
import { listCategoriesRequest, listExpensesRequest } from '../api/expenses';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { buildExpenseQuery, hasActiveFilters, setPage } from '../store/expenseFiltersSlice';
import type { Category, Expense, Pagination as PaginationInfo } from '../types';

export default function ExpensesPage() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.expenseFilters);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  // The result remembers which query produced it, so "loading" can be derived.
  const [result, setResult] = useState<{
    query: string;
    expenses: Expense[];
    pagination: PaginationInfo | null;
    error: string | null;
  } | null>(null);

  const query = buildExpenseQuery(filters);
  const loading = result === null || result.query !== query;
  const error = categoryError ?? (result && result.query === query ? result.error : null);
  const expenses = result?.expenses ?? [];
  const pagination = result?.pagination ?? null;

  useEffect(() => {
    listCategoriesRequest()
      .then((data) => setCategories(data.categories))
      .catch(() => setCategoryError('Could not load categories.'));
  }, []);

  useEffect(() => {
    let cancelled = false;

    listExpensesRequest(query)
      .then((data) => {
        if (!cancelled) setResult({ query, expenses: data.expenses, pagination: data.pagination, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setResult({
            query,
            expenses: [],
            pagination: null,
            error: err instanceof Error ? err.message : 'Could not load expenses.',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Expenses
      </Typography>

      <Box sx={{ mb: 3 }}>
        <ExpenseFilters categories={categories} />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : expenses.length === 0 && !error ? (
        <Alert severity="info">
          {hasActiveFilters(filters)
            ? 'No expenses match your filters.'
            : 'No expenses yet. Adding expenses comes in the next step.'}
        </Alert>
      ) : (
        <>
          <ExpenseList expenses={expenses} />
          {pagination && pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={(_, value) => dispatch(setPage(value))}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}