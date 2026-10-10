export type Role = 'user' | 'admin';

export type PaymentMethod = 'cash' | 'card' | 'mobile_money' | 'bank_transfer';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  is_default: boolean;
}

export interface Expense {
  id: number;
  title: string;
  amount: number;
  categoryId: number;
  categoryName: string;
  date: string; 
  paymentMethod: PaymentMethod;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}


export interface ExpenseInput {
  title: string;
  amount: number;
  categoryId: number;
  date: string;
  paymentMethod: PaymentMethod;
  notes: string | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ExpenseListResponse {
  expenses: Expense[];
  pagination: Pagination;
}

export type BudgetStatus = 'none' | 'within' | 'approaching' | 'over';

export interface BudgetSummary {
  month: string;
  amount: number | null;
  spent: number;
  remaining: number | null;
  status: BudgetStatus;
}

export interface CategorySpending {
  categoryId: number;
  categoryName: string;
  total: number;
  count: number;
}

export interface DashboardData {
  month: string;
  totalSpent: number;
  budget: BudgetSummary;
  highestExpense: Expense | null;
  spendingByCategory: CategorySpending[];
  recentExpenses: Expense[];
}

export interface AdminRecentExpense {
  id: number;
  title: string;
  amount: number;
  categoryName: string;
  userName: string;
  date: string;
  createdAt: string;
}

export interface AdminRecentUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface AdminInsights {
  totalUsers: number;
  totalExpenses: number;
  totalExpenseValue: number;
  expensesThisMonth: number;
  spendingByCategory: CategorySpending[];
  mostUsedCategories: CategorySpending[];
  leastUsedCategories: CategorySpending[];
  recentExpenses: AdminRecentExpense[];
  recentUsers: AdminRecentUser[];
}