import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  createCategoryRequest,
  deleteCategoryRequest,
  renameCategoryRequest,
} from '../api/admin';
import { listCategoriesRequest } from '../api/expenses';
import ConfirmDialog from './ConfirmDialog';
import type { Category } from '../types';

export default function CategoryManager() {
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<{ key: number; categories: Category[]; error: string | null } | null>(null);

  const loading = result === null || result.key !== reloadKey;
  const categories = result && result.key === reloadKey ? result.categories : [];
  const loadError = result && result.key === reloadKey ? result.error : null;

  const [newName, setNewName] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const [editing, setEditing] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);

  const [deleting, setDeleting] = useState<Category | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    listCategoriesRequest()
      .then((data) => {
        if (!cancelled) setResult({ key: reloadKey, categories: data.categories, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setResult({
            key: reloadKey,
            categories: [],
            error: err instanceof Error ? err.message : 'Could not load categories.',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  async function handleAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddError(null);
    if (newName.trim().length < 2) {
      setAddError('Category name must be at least 2 characters.');
      return;
    }
    setAdding(true);
    try {
      await createCategoryRequest(newName.trim());
      setNewName('');
      setToast('Category added.');
      setReloadKey((key) => key + 1);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Could not add the category.');
    } finally {
      setAdding(false);
    }
  }

  function openEdit(category: Category) {
    setEditing(category);
    setEditName(category.name);
    setEditError(null);
  }

  async function handleRename() {
    if (!editing) return;
    if (editName.trim().length < 2) {
      setEditError('Category name must be at least 2 characters.');
      return;
    }
    setSavingEdit(true);
    try {
      await renameCategoryRequest(editing.id, editName.trim());
      setEditing(null);
      setToast('Category renamed.');
      setReloadKey((key) => key + 1);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Could not rename the category.');
    } finally {
      setSavingEdit(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      const response = await deleteCategoryRequest(deleting.id);
      setToast(
        response.expensesReassigned > 0
          ? `Category deleted. ${response.expensesReassigned} expense(s) moved to Uncategorized.`
          : 'Category deleted.'
      );
      setReloadKey((key) => key + 1);
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Could not delete the category.');
    } finally {
      setDeleteBusy(false);
      setDeleting(null);
    }
  }

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Add a category
          </Typography>
          {addError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {addError}
            </Alert>
          )}
          <Box component="form" onSubmit={handleAdd} noValidate sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <TextField
              label="Category name"
              size="small"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              sx={{ flexGrow: 1, minWidth: 200 }}
            />
            <Button type="submit" variant="contained" disabled={adding}>
              {adding ? <CircularProgress size={22} /> : 'Add'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {loadError && <Alert severity="error">{loadError}</Alert>}

      {loading && !loadError ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gap: 1.5 }}>
          {categories.map((category) => (
            <Card key={category.id} variant="outlined">
              <CardContent
                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, py: 1.5, '&:last-child': { pb: 1.5 } }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography>{category.name}</Typography>
                  {category.is_default && <Chip label="Default" size="small" />}
                </Box>
                {!category.is_default && (
                  <Box>
                    <IconButton aria-label={`Rename ${category.name}`} onClick={() => openEdit(category)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton aria-label={`Delete ${category.name}`} onClick={() => setDeleting(category)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Dialog open={editing !== null} onClose={() => setEditing(null)} fullWidth maxWidth="xs">
        <DialogTitle>Rename category</DialogTitle>
        <DialogContent>
          {editError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {editError}
            </Alert>
          )}
          <TextField
            autoFocus
            label="Category name"
            fullWidth
            margin="dense"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditing(null)} disabled={savingEdit}>
            Cancel
          </Button>
          <Button onClick={handleRename} variant="contained" disabled={savingEdit}>
            {savingEdit ? <CircularProgress size={22} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete category?"
        message={`Any expenses in "${deleting?.name ?? ''}" will be moved to "Uncategorized". The category itself will be removed.`}
        confirmLabel="Delete"
        busy={deleteBusy}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />

      <Snackbar open={toast !== null} autoHideDuration={4000} onClose={() => setToast(null)} message={toast ?? ''} />
    </Box>
  );
}