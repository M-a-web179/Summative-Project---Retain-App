import { useCallback, useEffect, useState } from 'react';
import { Box, Button, MenuItem, TextField } from '@mui/material';
import type { Category } from '../types';
import type { PaymentMethod } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  hasActiveFilters,
  resetFilters,
  setCategory,
  setDateRange,
  setPaymentMethod,
  setSearch,
  setSort,
} from '../store/expenseFiltersSlice';
import type { SortField, SortOrder } from '../store/expenseFiltersSlice';
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '../utils/format';

interface ExpenseFiltersProps {
  categories: Category[];
}

// Search box with its own local text. Redux is updated after a short pause.
// The parent changes `key` when filters are cleared, which resets the text.
function DebouncedSearch({ initialValue, onChange }: { initialValue: string; onChange: (value: string) => void }) {
  const [text, setText] = useState(initialValue);

  useEffect(() => {
    if (text === initialValue) return;
    const timer = setTimeout(() => onChange(text), 400);
    return () => clearTimeout(timer);
  }, [text, initialValue, onChange]);

  return <TextField label="Search title" value={text} onChange={(e) => setText(e.target.value)} size="small" />;
}

export default function ExpenseFilters({ categories }: ExpenseFiltersProps) {
  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.expenseFilters);

  const sortValue = `${filters.sortBy}-${filters.order}`;
  const handleSearch = useCallback((value: string) => dispatch(setSearch(value)), [dispatch]);

  function handleSortChange(value: string) {
    const [sortBy, order] = value.split('-') as [SortField, SortOrder];
    dispatch(setSort({ sortBy, order }));
  }

  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' } }}>
      <DebouncedSearch
        key={filters.search === '' ? 'empty' : 'active'}
        initialValue={filters.search}
        onChange={handleSearch}
      />

      <TextField
        select
        label="Category"
        size="small"
        value={filters.categoryId ?? ''}
        onChange={(e) => dispatch(setCategory(e.target.value === '' ? null : Number(e.target.value)))}
      >
        <MenuItem value="">All categories</MenuItem>
        {categories.map((category) => (
          <MenuItem key={category.id} value={category.id}>
            {category.name}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Payment method"
        size="small"
        value={filters.paymentMethod ?? ''}
        onChange={(e) => dispatch(setPaymentMethod(e.target.value === '' ? null : (e.target.value as PaymentMethod)))}
      >
        <MenuItem value="">All methods</MenuItem>
        {PAYMENT_METHODS.map((method) => (
          <MenuItem key={method} value={method}>
            {PAYMENT_METHOD_LABELS[method]}
          </MenuItem>
        ))}
      </TextField>

      <TextField
        label="From"
        type="date"
        size="small"
        value={filters.startDate}
        onChange={(e) => dispatch(setDateRange({ startDate: e.target.value, endDate: filters.endDate }))}
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <TextField
        label="To"
        type="date"
        size="small"
        value={filters.endDate}
        onChange={(e) => dispatch(setDateRange({ startDate: filters.startDate, endDate: e.target.value }))}
        slotProps={{ inputLabel: { shrink: true } }}
      />

      <TextField select label="Sort by" size="small" value={sortValue} onChange={(e) => handleSortChange(e.target.value)}>
        <MenuItem value="date-desc">Date (newest first)</MenuItem>
        <MenuItem value="date-asc">Date (oldest first)</MenuItem>
        <MenuItem value="amount-desc">Amount (highest first)</MenuItem>
        <MenuItem value="amount-asc">Amount (lowest first)</MenuItem>
      </TextField>

      {hasActiveFilters(filters) && (
        <Box>
          <Button onClick={() => dispatch(resetFilters())}>Clear filters</Button>
        </Box>
      )}
    </Box>
  );
}