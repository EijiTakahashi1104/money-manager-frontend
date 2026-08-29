// src/types.ts
export type Category = {
  id: number;
  name: string;
  defaultBudgetAmount: number; // バックエンドの修正に合わせて BigDecimal はフロントでは number として扱います
};

export type Expense = {
  id?: number;
  title: string;
  amount: number;
  categoryId: number;
  expenseDate: string;
  memo?: string;
};

// 予算データの型もここに追加しておきます
export type Budget = {
  id?: number;
  categoryId: number;
  yearMonth: string;
  budgetAmount: number;
};