import { request } from './client';
import type { Category, Expense, ExpenseInput, ExpenseListResponse } from '../types';

export function listExpensesRequest(queryString: string): Promise<ExpenseListResponse> {
  return request<ExpenseListResponse>(`/expenses${queryString ? `?${queryString}` : ''}`);
}

export function getExpenseRequest(id: number): Promise<{ expense: Expense }> {
  return request<{ expense: Expense }>(`/expenses/${id}`);
}

export function createExpenseRequest(input: ExpenseInput): Promise<{ expense: Expense }> {
  return request<{ expense: Expense }>('/expenses', { method: 'POST', body: input });
}

export function updateExpenseRequest(id: number, input: ExpenseInput): Promise<{ expense: Expense }> {
  return request<{ expense: Expense }>(`/expenses/${id}`, { method: 'PUT', body: input });
}

export function deleteExpenseRequest(id: number): Promise<{ message: string }> {
  return request<{ message: string }>(`/expenses/${id}`, { method: 'DELETE' });
}

export function listCategoriesRequest(): Promise<{ categories: Category[] }> {
  return request<{ categories: Category[] }>('/categories');
}