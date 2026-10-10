import { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Container, Dialog, DialogContent, DialogTitle, Pagination, Snackbar, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ConfirmDialog from '../components/ConfirmDialog';
import ExpenseDetail from '../components/ExpenseDetail';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseFilters from '../components/ExpenseFilters';
import ExpenseList from '../components/ExpenseList';
import { createExpenseRequest, deleteExpenseRequest, listCategoriesRequest, listExpensesRequest, updateExpenseRequest } from '../api/expenses';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { buildExpenseQuery, hasActiveFilters, setPage } from '../store/expenseFiltersSlice';
import type { Category, Expense, ExpenseInput, Pagination as PaginationInfo } from '../types';

export default function ExpensesPage() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.expenseFilters);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | undefined>(undefined);
  const [viewing, setViewing] = useState<Expense | null>(null);
  const [deleting, setDeleting] = useState<Expense | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [result, setResult] = useState<{
    query: string;
    expenses: Expense[];
    pagination: PaginationInfo | null;
    error: string | null;
  } | null>(null);

  const query = `${buildExpenseQuery(filters)}#${reloadKey}`;
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

    listExpensesRequest(query.split('#')[0])
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

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(expense: Expense) {
    setEditing(expense);
    setFormOpen(true);
  }

  async function handleSave(input: ExpenseInput) {
    if (editing) {
      await updateExpenseRequest(editing.id, input);
      setToast('Expense updated.');
    } else {
      await createExpenseRequest(input);
      setToast('Expense added.');
    }
    setFormOpen(false);
    setReloadKey((key) => key + 1);
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await deleteExpenseRequest(deleting.id);
      setToast('Expense deleted.');
      setReloadKey((key) => key + 1);
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Could not delete the expense.');
    } finally {
      setDeleteBusy(false);
      setDeleting(null);
    }
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="h4" component="h1">
          Expenses
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Add expense
        </Button>
      </Box>

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
            : 'No expenses yet. Click "Add expense" to create your first one.'}
        </Alert>
      ) : (
        <>
          <ExpenseList expenses={expenses} onView={setViewing} onEdit={openEdit} onDelete={setDeleting} />
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

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editing ? 'Edit expense' : 'Add expense'}</DialogTitle>
        <DialogContent>
          <ExpenseForm
            key={editing?.id ?? 'new'}
            categories={categories}
            expense={editing}
            onSubmit={handleSave}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={viewing !== null} onClose={() => setViewing(null)} fullWidth maxWidth="xs">
        <DialogTitle>{viewing?.title}</DialogTitle>
        <DialogContent>{viewing && <ExpenseDetail expense={viewing} />}</DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete expense?"
        message={`"${deleting?.title ?? ''}" will be permanently deleted.`}
        confirmLabel="Delete"
        busy={deleteBusy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />

      <Snackbar open={toast !== null} autoHideDuration={3000} onClose={() => setToast(null)} message={toast ?? ''} />
    </Container>
  );
}