import { request } from './client';
import type { BudgetSummary, DashboardData } from '../types';

export function getDashboardRequest(month: string): Promise<DashboardData> {
  return request<DashboardData>(`/dashboard?month=${encodeURIComponent(month)}`);
}

export function setBudgetRequest(month: string, amount: number): Promise<{ budget: BudgetSummary }> {
  return request<{ budget: BudgetSummary }>(`/budgets/${encodeURIComponent(month)}`, {
    method: 'PUT',
    body: { amount },
  });
}