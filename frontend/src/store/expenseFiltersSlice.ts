import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { PaymentMethod } from '../types';

export type SortField = 'date' | 'amount';
export type SortOrder = 'asc' | 'desc';

export interface ExpenseFiltersState {
  search: string;
  categoryId: number | null;
  paymentMethod: PaymentMethod | null;
  startDate: string; 
  endDate: string;
  sortBy: SortField;
  order: SortOrder;
  page: number;
  limit: number;
}

export const initialFiltersState: ExpenseFiltersState = {
  search: '',
  categoryId: null,
  paymentMethod: null,
  startDate: '',
  endDate: '',
  sortBy: 'date',
  order: 'desc',
  page: 1,
  limit: 10,
};

const expenseFiltersSlice = createSlice({
  name: 'expenseFilters',
  initialState: initialFiltersState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
      state.page = 1;
    },
    setCategory(state, action: PayloadAction<number | null>) {
      state.categoryId = action.payload;
      state.page = 1;
    },
    setPaymentMethod(state, action: PayloadAction<PaymentMethod | null>) {
      state.paymentMethod = action.payload;
      state.page = 1;
    },
    setDateRange(state, action: PayloadAction<{ startDate: string; endDate: string }>) {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
      state.page = 1;
    },
    setSort(state, action: PayloadAction<{ sortBy: SortField; order: SortOrder }>) {
      state.sortBy = action.payload.sortBy;
      state.order = action.payload.order;
      state.page = 1;
    },
    setPage(state, action: PayloadAction<number>) {
      state.page = Math.max(1, action.payload);
    },
    resetFilters() {
      return initialFiltersState;
    },
  },
});

export const { setSearch, setCategory, setPaymentMethod, setDateRange, setSort, setPage, resetFilters } =
  expenseFiltersSlice.actions;

export default expenseFiltersSlice.reducer;


export function buildExpenseQuery(filters: ExpenseFiltersState): string {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set('search', filters.search.trim());
  if (filters.categoryId !== null) params.set('category', String(filters.categoryId));
  if (filters.paymentMethod) params.set('paymentMethod', filters.paymentMethod);
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);
  params.set('sortBy', filters.sortBy);
  params.set('order', filters.order);
  params.set('page', String(filters.page));
  params.set('limit', String(filters.limit));
  return params.toString();
}


export function hasActiveFilters(filters: ExpenseFiltersState): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.categoryId !== null ||
    filters.paymentMethod !== null ||
    filters.startDate !== '' ||
    filters.endDate !== ''
  );
}