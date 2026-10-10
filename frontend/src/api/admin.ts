import { request } from './client';
import type { AdminInsights, Category } from '../types';

export function getInsightsRequest(): Promise<AdminInsights> {
  return request<AdminInsights>('/admin/insights');
}

export function createCategoryRequest(name: string): Promise<{ category: Category }> {
  return request<{ category: Category }>('/categories', { method: 'POST', body: { name } });
}

export function renameCategoryRequest(id: number, name: string): Promise<{ category: Category }> {
  return request<{ category: Category }>(`/categories/${id}`, { method: 'PUT', body: { name } });
}

export function deleteCategoryRequest(id: number): Promise<{ message: string; expensesReassigned: number }> {
  return request<{ message: string; expensesReassigned: number }>(`/categories/${id}`, { method: 'DELETE' });
}